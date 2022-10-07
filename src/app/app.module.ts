import { HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { addDummyDynamicComponentProviders } from '@fronts/nyc-dynamic-components/core';
import { NavigationType } from '@fronts/nyc-navigation';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NycConsentsModule } from './consents/consents.module';
import { ConsentId, ConsentValue } from './consents/models/consent.model';
import { AbstractConsentsConnectorService } from './consents/services/consents-connector.service';
import { StepperComponent } from './stepper/stepper.component';

@Injectable()
export class ConsentsConnectorService
  implements AbstractConsentsConnectorService
{
  getConsentsToDisplay(): ConsentId[] {
    return [
      ConsentId.generalConditions,
      ConsentId.socialSecurityTreasuryDataValidation,
    ];
  }
  formSubmittedSuccessfully: (consents: ConsentValue[]) => void;
  formCancelled: (fields: { [key: string]: unknown }) => void;
  getNavigationType$(): Observable<NavigationType> {
    return of('bothWithCentralButton');
  }
  cancelSubscriptionAndRedirectToShop: () => void;
}

@NgModule({
  declarations: [AppComponent, StepperComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NycConsentsModule.withConnectorService(
      'http://dummy',
      ConsentsConnectorService
    ),
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: false,
          strictStateSerializability: true,
          strictActionSerializability: false,
          strictActionTypeUniqueness: true,
        },
      }
    ),
    EffectsModule.forRoot([]),
  ],
  providers: [addDummyDynamicComponentProviders()],
  bootstrap: [AppComponent],
})
export class AppModule {}
