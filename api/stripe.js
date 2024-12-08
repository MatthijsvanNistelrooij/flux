import Stripe from "stripe"

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export async function POST(request) {
  try {
    const { cartItems } = await request.json()

    if (!Array.isArray(cartItems)) {
      return new Response(
        JSON.stringify({ error: "Invalid request format." }),
        { status: 400 }
      )
    }

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card", "ideal"], // Add iDEAL here
      billing_address_collection: "auto",
      shipping_options: [
        { shipping_rate: "shr_1PhZAXBmhFNlyWT7VnVH0BB3" },
        { shipping_rate: "shr_1PhZC6BmhFNlyWT73sA09U8t" },
      ],
      line_items: cartItems.map((item) => {
        const img = item.image[0].asset._ref
        const newImage = img
          ? img
              .replace(
                "image-",
                "https://cdn.sanity.io/images/329k7jk4/production/"
              )
              .replace("-webp", ".webp")
          : ""

        return {
          price_data: {
            currency: "eur", // iDEAL requires EUR currency
            product_data: {
              name: item.name,
              images: [newImage],
            },
            unit_amount: item.price * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${request.headers.get("origin")}/success`,
      cancel_url: `${request.headers.get("origin")}/canceled`,
    }

    const session = await stripe.checkout.sessions.create(params)

    return new Response(JSON.stringify({ id: session.id }), {
      status: 200,
    })
  } catch (err) {
    console.error("Stripe Checkout Error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.statusCode || 500,
    })
  }
}
