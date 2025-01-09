import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error("Please add webhoook secret in .env file");
    }

    const headerPayload = headers();
    const svix_id = (await headerPayload).get('svix-id');
    const svix_timestamp = (await headerPayload).get('svix-timestamp');
    const svix_signature = (await headerPayload).get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing SVIX headers", { status: 400 });
    }


    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET);

    let event: WebhookEvent;

    try {
        event = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature
        }) as WebhookEvent;

        console.log(event);


    } catch (error) {
        console.error("ERR: Verifying webhook", error);
        return new Response("Error: Invalid webhook", { status: 400 });

    }

    const { id } = event.data;
    const eventType = event.type

    console.log("Event ID: ", id);
    console.log("Event Type: ", eventType);

    if(eventType === 'user.created'){
        try {
            const {email_addresses,primary_email_address_id} = event.data
            console.log("Emails: ", email_addresses);
            console.log("Primary Email ID: ", primary_email_address_id);
            const primaryEmail = email_addresses.find(
                (email)=> email.id===primary_email_address_id
            )
            if(!primaryEmail){
                return new Response("Error: Primary Email not found", { status: 400 });
            }
            
            //We finally have a user, so create a user in neondb

            const newUser = await prisma.user.create({
                data:{
                    id: event.data.id!,
                    email:primaryEmail.email_address,
                    isSubscribed:false
                }
            })

            console.log("New User Created: ", newUser);


        } catch (error) {
            return new Response("Error: Creating User", { status: 400 });
        }
    }

    return new Response('Webhook received successfully',{status:200})

}