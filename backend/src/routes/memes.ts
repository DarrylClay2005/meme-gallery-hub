import { Router } from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const s3 = new S3Client({ region: process.env.AWS_REGION })
const BUCKET = process.env.S3_BUCKET_NAME as string

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.coerce.boolean().default(true),
  tags: z.string().transform((s) => s.split(',').map(t => t.trim()).filter(Boolean)).optional()
})

router.get('/public', async (_req, res) => {
  try {
    const memes = await prisma.meme.findMany({
      where: { isPublic: true },
      include: { tags: { include: { tag: true } }, user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(memes)
  } catch {
    res.json([])
  }
})

router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) return res.json([])
  try {
    const memes = await prisma.meme.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
          { user: { username: { contains: q, mode: 'insensitive' } } }
        ]
      },
      include: { tags: { include: { tag: true } }, user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(memes)
  } catch {
    res.json([])
  }
})

router.get('/user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const memes = await prisma.meme.findMany({
      where: { userId: req.user!.id },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(memes)
  } catch {
    res.status(500).json({ error: 'Failed to load' })
  }
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    const meme = await prisma.meme.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, user: { select: { id: true, username: true } } }
    })
    if (!meme || (!meme.isPublic && !req.headers.authorization)) return res.status(404).json({ error: 'Not found' })
    res.json(meme)
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

router.post('/', requireAuth, upload.single('image'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' })
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { title, description, isPublic, tags } = parsed.data

  const key = `uploads/${req.user!.id}/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  }))
  const base = process.env.S3_PUBLIC_BASE_URL || `https://${BUCKET}.s3.amazonaws.com`
  const url = `${base}/${key}`

  const meme = await prisma.meme.create({ data: {
    title,
    description,
    isPublic,
    s3Key: key,
    s3Url: url,
    userId: req.user!.id,
  }})

  if (tags && tags.length) {
    for (const name of tags) {
      const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      await prisma.memeTag.create({ data: { memeId: meme.id, tagId: tag.id } })
    }
  }

  res.status(201).json(meme)
})

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const parsed = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const meme = await prisma.meme.findUnique({ where: { id } })
  if (!meme || meme.userId !== req.user!.id) return res.status(404).json({ error: 'Not found' })

  const updated = await prisma.meme.update({ where: { id }, data: parsed.data })

  if (parsed.data.tags) {
    await prisma.memeTag.deleteMany({ where: { memeId: id } })
    for (const name of parsed.data.tags) {
      const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      await prisma.memeTag.create({ data: { memeId: id, tagId: tag.id } })
    }
  }

  res.json(updated)
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const meme = await prisma.meme.findUnique({ where: { id } })
  if (!meme || meme.userId !== req.user!.id) return res.status(404).json({ error: 'Not found' })

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: meme.s3Key }))
  await prisma.memeTag.deleteMany({ where: { memeId: id } })
  await prisma.meme.delete({ where: { id } })
  res.status(204).send()
})

export default router
