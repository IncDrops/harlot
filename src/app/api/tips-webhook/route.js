export async function POST(req) {
    const body = await req.json();
    console.log("Webhook received:", body);
  
    // Your webhook logic goes here...
  
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  