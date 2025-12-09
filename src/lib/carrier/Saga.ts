// This is a simulated third-party API for the "Saga" carrier.
// Note its incompatible interface compared to our CarrierAdapter.

export interface SagaShipmentRequest {
  ref: string;
  destination: string;
  poids: number;
}

export interface SagaShipmentResponse {
  ok: boolean;
  numero_suivi: string | null;
  error?: string;
}

export class SagaAPI {
  public async bookDelivery(request: SagaShipmentRequest): Promise<SagaShipmentResponse> {
    console.log(`[SagaAPI] Booking delivery for order ref: ${request.ref}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    if (request.poids > 50) {
      return {
        ok: false,
        numero_suivi: null,
        error: 'Package is too heavy for Saga Express.',
      };
    }

    const trackingNumber = `SAGA-${Date.now()}`;
    console.log(`[SagaAPI] Shipment successful. Tracking: ${trackingNumber}`);
    
    return {
      ok: true,
      numero_suivi: trackingNumber,
    };
  }

  public async getStatus(suiviId: string): Promise<string> {
    console.log(`[SagaAPI] Getting status for tracking ID: ${suiviId}`);

    await new Promise(resolve => setTimeout(resolve, 50));

    if (suiviId.includes('SAGA')) {
      return 'Colis en cours dacheminement.';
    }
    return 'Inconnu';
  }
}
