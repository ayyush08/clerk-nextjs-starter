import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";


async function isAdmin(userId:string){
    const user = await clerkClient.users.getUser(userId)
    return user.privateMetadata.role === 'admin'
}

