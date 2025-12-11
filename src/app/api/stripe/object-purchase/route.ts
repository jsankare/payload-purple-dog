import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await req.json();
    const { objectId, buyerId } = body;

    console.log('[STRIPE] Données reçues:', { objectId, buyerId });

    if (!objectId || !buyerId) {
      console.error('[STRIPE] Données manquantes:', { objectId, buyerId });
      return NextResponse.json({ error: 'objectId et buyerId requis' }, { status: 400 });
    }

    // Récupérer l'objet à acheter
    const object = await payload.findByID({ collection: 'objects', id: objectId });
    if (!object) {
      console.error('[STRIPE] Objet non trouvé:', objectId);
      return NextResponse.json({ error: 'Objet non trouvé' }, { status: 404 });
    }
    if (object.status !== 'active') {
      console.error('[STRIPE] Objet non disponible:', objectId);
      return NextResponse.json({ error: 'Objet non disponible à la vente' }, { status: 400 });
    }

    // Récupérer l'utilisateur acheteur
    const buyer = await payload.findByID({ collection: 'users', id: buyerId });
    if (!buyer) {
      console.error('[STRIPE] Acheteur non trouvé:', buyerId);
      return NextResponse.json({ error: 'Acheteur non trouvé' }, { status: 404 });
    }
    if (!buyer.stripeCustomerId) {
      console.error('[STRIPE] Acheteur sans stripeCustomerId:', buyerId);
      return NextResponse.json({ error: 'Acheteur sans stripeCustomerId' }, { status: 400 });
    }

    // Créer la session Stripe Checkout (paiement unique)
    try {
      const session = await stripe.checkout.sessions.create({
        customer: buyer.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: object.name,
              },
              unit_amount: Math.round(object.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/payment/cancel`,
        metadata: {
          objectId: objectId,
          buyerId: buyerId,
        },
      });
      console.log('[STRIPE] Session créée:', session.id);
      return NextResponse.json({ sessionId: session.id, url: session.url, publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY });
    } catch (stripeError: any) {
      console.error('[STRIPE] Erreur Stripe:', stripeError);
      return NextResponse.json({ error: 'Erreur Stripe', details: stripeError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur création session achat objet:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la session de paiement', details: error.message }, { status: 500 });
  }
}
