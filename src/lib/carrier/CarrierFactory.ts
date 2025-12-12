import { CarrierAdapter } from './CarrierAdapter';
import { ColissimoAdapter } from './ColissimoAdapter';
import { SagaAdapter } from './SagaAdapter';

export type SupportedCarrier = 'saga' | 'colissimo';

export class CarrierFactory {
  public static create(carrier: SupportedCarrier): CarrierAdapter {
    switch (carrier) {
      case 'saga':
        return new SagaAdapter();
      case 'colissimo':
        return new ColissimoAdapter();
      default:
        throw new Error(`Carrier "${carrier}" is not supported.`);
    }
  }
}
