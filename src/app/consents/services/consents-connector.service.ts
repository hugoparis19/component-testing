import { NavigationType } from '@fronts/nyc-navigation';
import { Observable } from 'rxjs';
import { ConsentId, ConsentValue } from '../models/consent.model';

export abstract class AbstractConsentsConnectorService {
  abstract getConsentsToDisplay(): ConsentId[];
  abstract formSubmittedSuccessfully: (consents: ConsentValue[]) => void;
  abstract formCancelled: (fields: { [key: string]: unknown }) => void;
  abstract getNavigationType$(): Observable<NavigationType>;
  cancelSubscriptionAndRedirectToShop: () => void;
}

