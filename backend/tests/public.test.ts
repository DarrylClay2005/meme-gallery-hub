import request from 'supertest'
import app from '../src/index'

// Note: This is a lightweight test that ensures public routes exist

describe('Public routes', () => {
  it('GET /memes/public returns array', async () => {
    const res = await request(app).get('/memes/public')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
