import {
  CarrierAdapter,
  ShipmentConfirmation,
  ShipmentDetails,
  TrackingInfo,
} from './CarrierAdapter';
import { ColissimoAPI } from './Colissimo';

export class ColissimoAdapter implements CarrierAdapter {
  private colissimoApi = new ColissimoAPI();

  async createShipment(details: ShipmentDetails): Promise<ShipmentConfirmation> {

    const colissimoRequest = {
      orderNumber: details.orderId,
      recipientAddress: details.address,
      weightInGrams: details.weight * 1000,
    };

    const response = await this.colissimoApi.submitShipment(colissimoRequest);

    return {
      success: response.status === 'OK',
      trackingId: response.trackingCode,
      message: response.errorMessage || (response.status === 'OK' ? 'Shipment submitted to Colissimo.' : 'Unknown error'),
    };
  }

  async getTrackingInfo(trackingId: string): Promise<TrackingInfo> {
    const trackingData = await this.colissimoApi.fetchTracking(trackingId);

    let translatedStatus: TrackingInfo['status'];
    switch (trackingData.code) {
      case 100:
        translatedStatus = 'in_transit';
        break;
      case 200:
        translatedStatus = 'delivered';
        break;
      default:
        translatedStatus = 'failed';
        break;
    }

    return {
      status: translatedStatus,
      lastUpdate: new Date(),
      location: trackingData.lastKnownLocation,
    };
  }
}
