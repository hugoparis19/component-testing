import { ConsentConfiguration, ConsentId } from './consent.model';

export function getConsentsConfiguration(): {
  [key in ConsentId]: ConsentConfiguration;
} {
  return {
    [ConsentId.agreeToReceiveCommunicationFromYounitedCredit]: {
      defaultValue: false,
      checkBoxType: 'not-mandatory',
      consentId: ConsentId.agreeToReceiveCommunicationFromYounitedCredit,
      text: 'consents.agree_to_receive_communication_from_younited_credit'
    },
    [ConsentId.agreeToCommunicatePersonalDataToPartners]: {
      defaultValue: false,
      checkBoxType: 'not-mandatory',
      consentId: ConsentId.agreeToCommunicatePersonalDataToPartners,
      text: 'consents.agree_to_communicate_personal_data_to_partners'
    },
    [ConsentId.generalConditions]: {
      defaultValue: false,
      checkBoxType: 'mandatory-true',
      consentId: ConsentId.generalConditions,
      text: 'consents.general_conditions'
    },
    [ConsentId.socialSecurityTreasuryDataValidation]: {
      defaultValue: false,
      checkBoxType: 'mandatory-true',
      consentId: ConsentId.socialSecurityTreasuryDataValidation,
      text: 'consents.social_security_treasury_data_validation'
    },
    [ConsentId.dataManagement]: {
      defaultValue: false,
      checkBoxType: 'mandatory-true',
      consentId: ConsentId.dataManagement,
      text: 'consents.data_management'
    }
  };
}
