import {
  CarrierAdapter,
  ShipmentConfirmation,
  ShipmentDetails,
  TrackingInfo,
} from './CarrierAdapter';
import { SagaAPI } from './Saga';

export class SagaAdapter implements CarrierAdapter {
  private sagaApi = new SagaAPI();

  async createShipment(details: ShipmentDetails): Promise<ShipmentConfirmation> {
    const sagaRequest = {
      ref: details.orderId,
      destination: details.address,
      poids: details.weight,
    };

    const response = await this.sagaApi.bookDelivery(sagaRequest);

    return {
      success: response.ok,
      trackingId: response.numero_suivi,
      message: response.error || (response.ok ? 'Shipment booked with Saga.' : 'Unknown error'),
    };
  }

  async getTrackingInfo(trackingId: string): Promise<TrackingInfo> {
    const status = await this.sagaApi.getStatus(trackingId);

    let translatedStatus: TrackingInfo['status'] = 'pending';
    if (status === 'Colis en cours dacheminement.') {
      translatedStatus = 'in_transit';
    } else if (status === 'Livré') {
      translatedStatus = 'delivered';
    } else if (status === 'Inconnu') {
        translatedStatus = 'failed';
    }

    return {
      status: translatedStatus,
      lastUpdate: new Date(),
      location: 'Unknown',
    };
  }
}
