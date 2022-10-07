import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CheckBoxService } from '@fronts/nyc-dynamic-components/checkbox';
import {
  DynamicField,
  DynamicParams,
  isStepValid,
  scrollToFirstFieldInError,
} from '@fronts/nyc-dynamic-components/core';
import { NavigationType } from '@fronts/nyc-navigation';
import { ComponentStore } from '@ngrx/component-store';
import { concatLatestFrom } from '@ngrx/effects';
import { exhaustMap, map, Observable, tap } from 'rxjs';
import {
  Consent,
  ConsentConfiguration,
  ConsentId,
  ConsentValue,
} from '../models/consent.model';
import { getConsentsConfiguration } from '../models/consents.settings';
import { AbstractConsentsConnectorService } from '../services/consents-connector.service';
import { NycConsentsService } from '../services/consents.service';

@Component({
  selector: 'nyc-forms-consents',
  templateUrl: './consents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NycConsentsComponent
  extends ComponentStore<{
    consents: ConsentValue[];
    acceptAllValue: boolean;
    initDone: boolean;
  }>
  implements OnInit
{
  @ViewChildren('consent_checkbox')
  protected consentsCheckBoxes: QueryList<DynamicField>;

  acceptAllParams: DynamicParams<boolean>;
  consentsToDisplay: Consent[];
  navigationType$: Observable<NavigationType>;

  readonly initDone$: Observable<boolean> = this.select(
    (state) => state.initDone
  );

  readonly acceptAllValue$: Observable<boolean> = this.select(
    (state) => state.acceptAllValue
  );
  readonly setAcceptAll = this.updater((state, acceptAllValue: boolean) => ({
    ...state,
    acceptAllValue,
  }));

  readonly setInitDone = this.updater((state, initDone: boolean) => ({
    ...state,
    initDone,
  }));
  private readonly setConsentValue = this.updater(
    (state, value: ConsentValue) => {
      const indexToUpdate = state.consents.findIndex(
        (c) => c.consentId === value.consentId
      );
      const newConsents = [
        ...state.consents.slice(0, indexToUpdate),
        value,
        ...state.consents.slice(indexToUpdate + 1),
      ];
      return {
        ...state,
        consents: newConsents,
      };
    }
  );

  private readonly init$ = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => (this.navigationType$ = this.connector.getNavigationType$())),
      exhaustMap(() =>
        this.consentsService.getFromCache$().pipe(
          tap((consentsDto) => {
            const consentsIds = this.connector.getConsentsToDisplay();

            this.consentsToDisplay = consentsIds.map((consentId) => ({
              value:
                consentsDto?.find((c) => c.consentId === consentId)?.value ??
                getConsentsConfiguration()[consentId].defaultValue,
              params: this.buildParams(getConsentsConfiguration()[consentId]),
              consentId,
              text: getConsentsConfiguration()[consentId].text,
            }));

            this.setConsents(
              this.consentsToDisplay.map(
                (consent) =>
                  ({
                    consentId: consent.consentId,
                    value: consent.value,
                  } as ConsentValue)
              )
            );

            this.acceptAllParams = {
              onValueUpdate: (value: boolean) => {
                this.setAcceptAll(value);
                this.setConsentsValues(value);
              },
            };

            this.updateSelectAllValue$();
          }),
          tap(() => this.setInitDone(true))
        )
      )
    )
  );

  private readonly setConsents = this.updater(
    (state, consents: ConsentValue[]) => ({
      ...state,
      consents,
    })
  );
  readonly submitForm$ = this.effect((trigger$) =>
    trigger$.pipe(
      concatLatestFrom(() => [this.state$]),
      exhaustMap(([, state]) =>
        this.consentsService
          .saveToCache$(state.consents)
          .pipe(
            map(() => this.connector.formSubmittedSuccessfully(state.consents))
          )
      )
    )
  );

  private readonly cancelForm$ = this.effect((trigger$) =>
    trigger$.pipe(
      concatLatestFrom(() => [this.state$]),
      map(([, state]) => this.connector.formCancelled(state))
    )
  );

  private readonly setConsentsValues = this.updater((state, value: boolean) => {
    const newConsents = state.consents.map((consentValue) => ({
      ...consentValue,
      value,
    }));
    return {
      ...state,
      consents: newConsents,
    };
  });
  readonly updateSelectAllValue$ = this.effect((trigger$) =>
    trigger$.pipe(
      concatLatestFrom(() => [this.state$]),
      map(([, state]) => {
        if (state.consents.every((c) => c.value === true)) {
          this.setAcceptAll(true);
        } else {
          this.setAcceptAll(false);
        }
      })
    )
  );

  constructor(
    private connector: AbstractConsentsConnectorService,
    private consentsService: NycConsentsService,
    private checkBoxService: CheckBoxService
  ) {
    super({ consents: [], acceptAllValue: false, initDone: false });
  }

  ngOnInit(): void {
    this.init$();
  }

  atLeastOneConsentCheckboxIsVisible(): boolean {
    return this.consentsToDisplay?.length >= 1;
  }

  getConsentValue$(consentId: ConsentId): Observable<boolean> {
    return this.select((state) => state.consents).pipe(
      map(
        (consent) =>
          consent.find((c) => c.consentId === consentId)?.value ?? false
      )
    );
  }

  private buildParams(
    consentRef: ConsentConfiguration
  ): DynamicParams<boolean> {
    const params = this.checkBoxService.getParams(consentRef.checkBoxType);
    return {
      ...params,
      onValueUpdate: (value) => {
        this.setConsentValue({ consentId: consentRef.consentId, value });
        this.updateSelectAllValue$();
      },
    };
  }

  onNext(): void {
    if (isStepValid(this.consentsCheckBoxes)) {
      this.submitForm$();
    } else {
      scrollToFirstFieldInError(this.consentsCheckBoxes);
    }
  }

  onBack(): void {
    this.cancelForm$();
  }

  onCentralButtonClick(): void {
    this.connector.cancelSubscriptionAndRedirectToShop();
  }
}
