import Stripe from "stripe"

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    if (req.method === "POST") { 
        
    }
}
