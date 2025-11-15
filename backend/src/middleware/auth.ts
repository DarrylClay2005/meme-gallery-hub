import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: { id: number }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  const token = auth.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number }
    req.user = { id: payload.id }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
