import { CheckBoxType } from '@fronts/nyc-dynamic-components/checkbox';
import { DynamicParams } from '@fronts/nyc-dynamic-components/core';

export const enum ConsentId {
  agreeToReceiveCommunicationFromYounitedCredit = 'AgreeToReceiveCommunicationFromYounitedCredit',
  agreeToCommunicatePersonalDataToPartners = 'AgreeToCommunicatePersonalDataToPartners',
  dataManagement = 'DataManagement',
  generalConditions = 'GeneralConditions',
  socialSecurityTreasuryDataValidation = 'SocialSecurityTreasuryDataValidation'
}

export interface Consent {
  value: boolean | undefined;
  params: DynamicParams<boolean>;
  consentId: ConsentId;
  text: string;
}

export interface ConsentValue {
  value: boolean;
  consentId: ConsentId;
}

export interface ConsentConfiguration {
  defaultValue: boolean;
  checkBoxType: CheckBoxType;
  consentId: ConsentId;
  text: string;
}
