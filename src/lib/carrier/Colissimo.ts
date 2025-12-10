// test avec api non REST
// interface de base pas compatible

type ColissimoRequest = {
  orderNumber: string;
  recipientAddress: string;
  weightInGrams: number;
};

type ColissimoResponse = {
  status: 'OK' | 'ERROR';
  trackingCode: string;
  errorMessage?: string;
};

type ColissimoTrackingData = {
  code: number;
  label: string;
  lastKnownLocation: string;
};

export class ColissimoAPI {
  public async submitShipment(data: ColissimoRequest): Promise<ColissimoResponse> {
    console.log(`[ColissimoAPI] Submitting shipment for order: ${data.orderNumber}`);

    await new Promise(resolve => setTimeout(resolve, 120));

    if (!data.recipientAddress) {
      return {
        status: 'ERROR',
        trackingCode: '',
        errorMessage: 'Address is missing.',
      };
    }

    const trackingCode = `COL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    console.log(`[ColissimoAPI] Shipment accepted. Tracking Code: ${trackingCode}`);
    
    return {
      status: 'OK',
      trackingCode,
    };
  }

  public async fetchTracking(code: string): Promise<ColissimoTrackingData> {
    console.log(`[ColissimoAPI] Fetching tracking for code: ${code}`);

    await new Promise(resolve => setTimeout(resolve, 60));

    if (code.startsWith('COL-')) {
      return {
        code: 100,
        label: 'In Transit',
        lastKnownLocation: 'Roissy Hub, FR',
      };
    }
    
    return {
      code: 404,
      label: 'Not Found',
      lastKnownLocation: '',
    };
  }
}
