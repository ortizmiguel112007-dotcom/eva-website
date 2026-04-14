import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
import 'dotenv/config'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Pool error:', err)
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma