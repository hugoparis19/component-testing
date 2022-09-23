import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckBoxModule } from '@fronts/nyc-dynamic-components/checkbox';
import { DynamicComponentsTestingModule, DynTestHelper } from '@fronts/nyc-dynamic-components/testing';
import { NycMonitoringModule } from '@fronts/nyc-monitoring';
import { NycNavigationButtonsComponent } from '@fronts/nyc-navigation';
import { SelectorHelper } from '@fronts/nyc-testing';
import { NycTranslationTestingModule } from '@fronts/nyc-translation';
import { MockComponent, MockProvider, MockService, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { spy, stub } from 'sinon';
import { ConsentId, ConsentValue } from '../models/consent.model';
import { getConsentsConfiguration } from '../models/consents.settings';
import { AbstractConsentsConnectorService } from '../services/consents-connector.service';
import { NycConsentsService } from '../services/consents.service';
import { NycConsentsComponent } from './consents.component';
describe(NycConsentsComponent.name, () => {
  let component: NycConsentsComponent;
  let fixture: ComponentFixture<NycConsentsComponent>;
  let consentsService: NycConsentsService;
  let consentsConnector: AbstractConsentsConnectorService;

  const consentsServiceMock = MockService(NycConsentsService, {
    getFromCache$: () => of([]),
    saveToCache$: () => of({ ['generalConditions']: true })
  });

  const connectorMock = MockService(AbstractConsentsConnectorService, {
    getConsentsToDisplay: () => [ConsentId.generalConditions, ConsentId.socialSecurityTreasuryDataValidation],
    formSubmittedSuccessfully: () => {
      // void
    },
    formCancelled: () => {
      // void
    },
    cancelSubscriptionAndRedirectToShop: () => {
      // dummy
    },
    getNavigationType$: () => of('bothWithCentralButton')
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NycMonitoringModule.withDummyAppInsightsHandler(),
        DynamicComponentsTestingModule,
        NycTranslationTestingModule.withTranslations({}),
        CheckBoxModule
      ],
      declarations: [NycConsentsComponent, MockComponent(NycNavigationButtonsComponent)],
      providers: [
        {
          provide: AbstractConsentsConnectorService,
          useValue: {
            getConsentsToDisplay: () => of()
          }
        },
        MockProvider(NycConsentsService, MockService(NycConsentsService, consentsServiceMock)),
        MockProvider(AbstractConsentsConnectorService, connectorMock)
      ]
    });
    fixture = TestBed.createComponent(NycConsentsComponent);
    component = fixture.componentInstance;
    consentsService = TestBed.inject(NycConsentsService);
    consentsConnector = TestBed.inject(AbstractConsentsConnectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    { consentId: ConsentId.agreeToCommunicatePersonalDataToPartners },
    { consentId: ConsentId.agreeToReceiveCommunicationFromYounitedCredit },
    { consentId: ConsentId.generalConditions },
    { consentId: ConsentId.socialSecurityTreasuryDataValidation }
  ].forEach(data => {
    it('should return good consent configuration for given ConsentIds', () => {
      // Act
      const consentConfiguration = getConsentsConfiguration()[data.consentId];
      // Assert
      expect(consentConfiguration.consentId).toEqual(data.consentId);
    });
  });

  describe('Test NycConsentsComponent Init', () => {
    it('should initDone$ be true', () => {
      // Arrange
      fixture = TestBed.createComponent(NycConsentsComponent);
      component = fixture.componentInstance;
      const spyFn = spy(component, 'setInitDone');
      // Act
      fixture.detectChanges();

      // Assert
      expect(spyFn.callCount).toBe(1);
      expect(SelectorHelper.for(fixture).getByDataTest('consents')).toBeTruthy();
    });
    [
      { consents: [ConsentId.generalConditions, ConsentId.socialSecurityTreasuryDataValidation] },
      { consents: [ConsentId.generalConditions] },
      { consents: [ConsentId.generalConditions, ConsentId.agreeToCommunicatePersonalDataToPartners, ConsentId.dataManagement] },
      {
        consents: [
          ConsentId.generalConditions,
          ConsentId.agreeToCommunicatePersonalDataToPartners,
          ConsentId.dataManagement,
          ConsentId.socialSecurityTreasuryDataValidation
        ]
      },
      {
        consents: [
          ConsentId.generalConditions,
          ConsentId.agreeToCommunicatePersonalDataToPartners,
          ConsentId.dataManagement,
          ConsentId.socialSecurityTreasuryDataValidation,
          ConsentId.agreeToReceiveCommunicationFromYounitedCredit
        ]
      }
    ].forEach(data => {
      it('Shoud init right checkboxes', () => {
        // Arrange
        stub(consentsConnector, 'getConsentsToDisplay').returns(data.consents);

        // Act
        fixture = TestBed.createComponent(NycConsentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Assert
        expect(component.consentsToDisplay.length).toEqual(data.consents.length);
        expect(component.consentsToDisplay.map(c => c.consentId)).toEqual(data.consents);
      });
    });

    [
      {
        consents: [{ consentId: ConsentId.agreeToCommunicatePersonalDataToPartners, value: false }],
        consentsIds: [ConsentId.agreeToCommunicatePersonalDataToPartners]
      },
      {
        consents: [
          { consentId: ConsentId.agreeToCommunicatePersonalDataToPartners, value: false },
          { consentId: ConsentId.generalConditions, value: true }
        ],
        consentsIds: [ConsentId.agreeToCommunicatePersonalDataToPartners, ConsentId.generalConditions]
      },
      {
        consents: [
          { consentId: ConsentId.agreeToCommunicatePersonalDataToPartners, value: false },
          { consentId: ConsentId.agreeToReceiveCommunicationFromYounitedCredit, value: false },
          { consentId: ConsentId.socialSecurityTreasuryDataValidation, value: true }
        ],
        consentsIds: [
          ConsentId.agreeToCommunicatePersonalDataToPartners,
          ConsentId.agreeToReceiveCommunicationFromYounitedCredit,
          ConsentId.socialSecurityTreasuryDataValidation
        ]
      }
    ].forEach(data => {
      it('should init checkboxes with cached values', () => {
        // Arrange
        stub(consentsService, 'getFromCache$').returns(of(data.consents));
        stub(consentsConnector, 'getConsentsToDisplay').returns(data.consentsIds);

        // Act
        fixture = TestBed.createComponent(NycConsentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Assert
        component.consentsToDisplay.forEach(c => {
          const consentValue = data.consents.find(consent => consent.consentId === c.consentId) as ConsentValue;
          expect(c.value).toEqual(consentValue.value);
        });
      });
    });
  });

  it('should at least one checkbox be visible', () => {
    // Arrange
    stub(consentsConnector, 'getConsentsToDisplay').returns([ConsentId.generalConditions, ConsentId.socialSecurityTreasuryDataValidation]);

    // Act
    fixture = TestBed.createComponent(NycConsentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert
    expect(component.atLeastOneConsentCheckboxIsVisible()).toBeTruthy();
  });

  it('should show no checkbox', () => {
    // Arrange
    stub(consentsConnector, 'getConsentsToDisplay').returns([]);

    // Act
    fixture = TestBed.createComponent(NycConsentsComponent);
    component = fixture.componentInstance;

    // Assert
    expect(component.atLeastOneConsentCheckboxIsVisible()).toBeFalsy();
  });

  describe('Test submit', () => {
    it('should call saveToCache$ on submit', () => {
      const spyFn = spy(consentsService, 'saveToCache$');
      component.submitForm$();
      expect(spyFn.callCount).toBe(1);
    });
    it('should call formSubmittedSuccessfully on submit when form is valid', () => {
      const spyFn = spy(consentsConnector, 'formSubmittedSuccessfully');
      component.submitForm$();
      expect(spyFn.calledOnce).toBeTruthy();
    });
    it('should not call submitForm$ when the form is invalid', () => {
      // arrange
      stub(consentsConnector, 'getConsentsToDisplay').returns([
        ConsentId.generalConditions,
        ConsentId.socialSecurityTreasuryDataValidation,
        ConsentId.dataManagement
      ]);
      fixture = TestBed.createComponent(NycConsentsComponent);
      component = fixture.componentInstance;
      const spyFn = spy(consentsConnector, 'formSubmittedSuccessfully');
      const spySubmit = spy(component, 'submitForm$');
      fixture.detectChanges();

      // act.
      DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.generalConditions).setValue(false);
      DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.socialSecurityTreasuryDataValidation).setValue(false);
      DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.dataManagement).setValue(false);
      component.onNext();

      // assert
      expect(spyFn.calledOnce).toBeFalsy();
      expect(spySubmit.calledOnce).toBeFalsy();
    });
    it('should call submitForm when form is valid', () => {
      // Arrange
      const spySubmit = spy(component, 'submitForm$');
      DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.generalConditions).setValue(true);
      DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.socialSecurityTreasuryDataValidation).setValue(true);
      // Act
      component.onNext();

      // Assert
      expect(spySubmit.calledOnce).toBeTruthy();
    });
  });

  it('should update all consents when click on accept all', () => {
    DynTestHelper.for(fixture).target('checkbox').byDataTest('selectAllConsents').setValue(true);
    fixture.detectChanges();
    // Assert
    expect(DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.generalConditions).getValue()).toBeTruthy();
    expect(DynTestHelper.for(fixture).target('checkbox').byDataTest(ConsentId.socialSecurityTreasuryDataValidation).getValue()).toBeTruthy();
  });

  it('should call connector back() function on goback()', () => {
    // Arrange
    const spyFn = spy(consentsConnector, 'formCancelled');

    // Act
    component.onBack();

    // Assert
    expect(spyFn.calledOnce).toBeTruthy();
  });

  it('should display navigation buttons', () => {
    // act.
    fixture.detectChanges();
    const mockComponent = ngMocks.findInstance(NycNavigationButtonsComponent);

    // assert
    expect(mockComponent.nextButtonLabel).toEqual('consents.navigation-next');
    expect(mockComponent.backButtonLabel).toEqual('consents.navigation-back');
    expect(mockComponent.centralButtonLabel).toEqual('consents.navigation-back-to-shop');
    expect(mockComponent).toBeTruthy();
  });
});

