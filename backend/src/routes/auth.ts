import { Router } from 'express'
import { prisma } from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = Router()

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30).optional(),
})

router.post('/register', async (req, res) => {
  const parsed = credsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password, username } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: {
    email,
    passwordHash: hash,
    username: username ?? email.split('@')[0]
  }})
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
  res.status(201).json({ token })
})

router.post('/login', async (req, res) => {
  const parsed = credsSchema.omit({ username: true }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
  res.json({ token })
})

export default router
