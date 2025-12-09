import { describe, it, expect } from 'vitest';
import { CarrierFactory, SupportedCarrier } from '../../src/lib/carrier/CarrierFactory';
import { SagaAdapter } from '../../src/lib/carrier/SagaAdapter';
import { ColissimoAdapter } from '../../src/lib/carrier/ColissimoAdapter';
import { ShipmentDetails } from '../../src/lib/carrier/CarrierAdapter';

describe('Carrier Integration', () => {
  describe('CarrierFactory', () => {
    it('should create SagaAdapter for "saga" carrier', () => {
      const adapter = CarrierFactory.create('saga');
      expect(adapter).toBeInstanceOf(SagaAdapter);
    });

    it('should create ColissimoAdapter for "colissimo" carrier', () => {
      const adapter = CarrierFactory.create('colissimo');
      expect(adapter).toBeInstanceOf(ColissimoAdapter);
    });

    it('should throw an error for an unsupported carrier', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => CarrierFactory.create('unsupported')).toThrow(
        'Carrier "unsupported" is not supported.',
      );
    });
  });

  const sampleShipment: ShipmentDetails = {
    orderId: 'ORDER-123',
    address: '123 Main St, 75001 Paris, France',
    weight: 5, // 5 kg
  };

  describe.each([
    { carrier: 'saga' as SupportedCarrier, expectedTrackingPrefix: 'SAGA-' },
    { carrier: 'colissimo' as SupportedCarrier, expectedTrackingPrefix: 'COL-' },
  ])('$carrier Adapter', ({ carrier, expectedTrackingPrefix }) => {
    const adapter = CarrierFactory.create(carrier);

    it('should create a shipment and return a tracking ID', async () => {
      const confirmation = await adapter.createShipment(sampleShipment);

      expect(confirmation.success).toBe(true);
      expect(confirmation.trackingId).not.toBeNull();
      expect(confirmation.trackingId).toMatch(new RegExp(`^${expectedTrackingPrefix}`));
      expect(confirmation.message).toMatch(/booked with Saga|submitted to Colissimo/);
    });

    it('should retrieve tracking info for a valid tracking ID', async () => {
      // First, create a shipment to get a real tracking ID from the mock
      const { trackingId } = await adapter.createShipment(sampleShipment);
      expect(trackingId).not.toBeNull();

      if (trackingId) {
        const trackingInfo = await adapter.getTrackingInfo(trackingId);
        expect(trackingInfo.status).toBe('in_transit');
        expect(trackingInfo.lastUpdate).toBeInstanceOf(Date);
      }
    });
  });
    
  describe('SagaAdapter specific failure case', () => {
    it('should fail to create a shipment for a heavy package', async () => {
      const adapter = CarrierFactory.create('saga');
      const heavyShipment: ShipmentDetails = {
        ...sampleShipment,
        weight: 60, // > 50kg limit for Saga
      };

      const confirmation = await adapter.createShipment(heavyShipment);

      expect(confirmation.success).toBe(false);
      expect(confirmation.trackingId).toBeNull();
      expect(confirmation.message).toBe('Package is too heavy for Saga Express.');
    });
  });
});
