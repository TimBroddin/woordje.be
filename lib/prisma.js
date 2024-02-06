import { Client } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fetch as undiciFetch } from 'undici'


dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`


const client = new Client({ url: connectionString })
const adapter = new PrismaPlanetScale(client)
const prisma = new PrismaClient({ adapter })
export default prisma;
