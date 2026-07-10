import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const g = await p.gateway.findMany();
console.log(JSON.stringify(g));
await p.$disconnect();
