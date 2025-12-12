export interface ShipmentDetails {
  orderId: string;
  address: string;
  weight: number;
}

export interface ShipmentConfirmation {
  success: boolean;
  trackingId: string | null;
  message: string;
}

export interface TrackingInfo {
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  lastUpdate: Date;
  location: string;
}

/**
 * Defines the standard interface for a carrier adapter.
 * Any carrier integration must implement this interface.
 */
export interface CarrierAdapter {
  /**
   * Creates a new shipment with the carrier.
   * @param details - The details of the shipment.
   * @returns A promise that resolves to the shipment confirmation.
   */
  createShipment(details: ShipmentDetails): Promise<ShipmentConfirmation>;

  /**
   * Retrieves the tracking information for a shipment.
   * @param trackingId - The tracking ID provided by the carrier.
   * @returns A promise that resolves to the tracking information.
   */
  getTrackingInfo(trackingId: string): Promise<TrackingInfo>;
}
