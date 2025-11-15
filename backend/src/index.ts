import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth'
import memeRoutes from './routes/memes'
import tagRoutes from './routes/tags'

const app = express()
app.use(helmet())
app.use(cors({ origin: '*'}))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/memes', memeRoutes)
app.use('/tags', tagRoutes)

const port = process.env.PORT || 8080
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`API listening on :${port}`))
}

export default app
