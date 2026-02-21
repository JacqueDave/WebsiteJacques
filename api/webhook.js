const Stripe = require('stripe');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Initialize with environment variables (set these in Vercel)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Vercel serverless function config to consume raw body for Stripe signature verification
const config = {
    api: {
        bodyParser: false,
    },
};

// Helper: Convert Next.js/Vercel raw stream to buffer
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. Verify the Stripe Webhook Signature
    try {
        event = stripe.webhooks.constructEvent(buf.toString(), sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Handle the specific successful checkout event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Extract customer email (prioritize customer_details.email over customer_email)
        const customerEmail = session.customer_details?.email || session.customer_email;

        if (!customerEmail) {
            console.error('No email found in session object');
            return res.status(400).send('No customer email provided');
        }

        try {
            // 3. Locate the PDF file to attach
            // NOTE: Ensure the actual PDF is placed in the 'assets' folder with this exact name
            const pdfPath = path.join(process.cwd(), 'assets', 'Leverage_in_the_Game_Guide.pdf');

            let pdfBuffer;
            try {
                pdfBuffer = fs.readFileSync(pdfPath);
            } catch (fileErr) {
                console.error('Could not find PDF file at path:', pdfPath);
                // Depending on how you want to fail gracefully. For now, we will throw to abort sending without attachment.
                throw new Error('PDF Guide attachment not found on server.');
            }

            // 4. Send the email via Resend
            const data = await resend.emails.send({
                from: 'Jacques <jacques@leverageinthegame.com>', // MUST BE A VERIFIED DOMAIN IN RESEND
                to: customerEmail,
                subject: 'Your Leverage in the Game Guide',
                html: `
          <div style="font-family: sans-serif; max-w-lg; line-height: 1.6; color: #16181d;">
            <p>Welcome to the inside.</p>
            <p>Attached to this email is your complete copy of <strong>Leverage in the Game: The Outsider's Guide to Earning Minutes, Trust, and Opportunity</strong>.</p>
            <p>Read it carefully. Apply the frameworks. Shift your perspective.</p>
            <br/>
            <p>Let's get to work,</p>
            <p><strong>Jacques</strong></p>
          </div>
        `,
                attachments: [
                    {
                        filename: 'Leverage_in_the_Game_Guide.pdf',
                        content: pdfBuffer,
                    },
                ],
            });

            console.log('Email successfully sent via Resend:', data);
            return res.status(200).json({ received: true, email_sent: true });

        } catch (error) {
            console.error('Error sending email via Resend:', error);
            return res.status(500).json({ error: 'Failed to send email' });
        }
    }

    // Return a 200 response to acknowledge receipt of other events
    res.status(200).json({ received: true });
};

module.exports.config = config;
