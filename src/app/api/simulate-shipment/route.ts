import { NextRequest, NextResponse } from 'next/server';
import { CarrierFactory, SupportedCarrier, ShipmentDetails } from '../../../lib/carrier';

function isSupportedCarrier(carrier: string): carrier is SupportedCarrier {
  return carrier === 'saga' || carrier === 'colissimo';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { carrier, orderId, address, weight } = body;

    if (!carrier || !orderId || !address || weight === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: carrier, orderId, address, weight' },
        { status: 400 },
      );
    }

    if (!isSupportedCarrier(carrier)) {
      return NextResponse.json(
        { error: `Invalid carrier. Supported carriers are: 'saga', 'colissimo'.` },
        { status: 400 },
      );
    }

    const adapter = CarrierFactory.create(carrier);
    const shipmentDetails: ShipmentDetails = {
      orderId,
      address,
      weight,
    };

    const confirmation = await adapter.createShipment(shipmentDetails);

    return NextResponse.json(confirmation, { status: 200 });
    // toujours une 200 pcq notre appel est ok meme si ça a fail du côté transporteur, à gérer plus tard

  } catch (error) {
    console.error('[API simulate-shipment] Error:', error);
    let message = 'An unknown error occurred.';
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
