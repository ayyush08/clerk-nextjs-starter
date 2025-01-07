import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const prismaClientSingleton = ()=>{
    return new PrismaClient();
}

//There could be a prisma connection or not 

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient |undefined }


export const prisma = globalForPrisma.prisma ?? prismaClientSingleton() //From global object get a prisma instance if not available create a new one using prismaClientSingleton


export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
