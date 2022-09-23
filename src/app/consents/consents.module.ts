import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CheckBoxModule } from '@fronts/nyc-dynamic-components/checkbox';
import { NycNavigationButtonsModule } from '@fronts/nyc-navigation';
import { TranslateModule } from '@ngx-translate/core';
import { NycConsentsComponent } from './components/consents.component';
import { BASE_API_URL } from './models/token.model';
import { AbstractConsentsConnectorService } from './services/consents-connector.service';
import { NycConsentsService } from './services/consents.service';
import { CreditApplicationService } from './services/credit-application.service';

@NgModule({
  imports: [CommonModule, TranslateModule, CheckBoxModule, NycNavigationButtonsModule],
  declarations: [NycConsentsComponent],
  providers: [NycConsentsService, CreditApplicationService],
  exports: [NycConsentsComponent]
})
export class NycConsentsModule {
  static withConnectorService(baseApiUrl: string, connectorService: Type<AbstractConsentsConnectorService>): ModuleWithProviders<NycConsentsModule> {
    return {
      ngModule: NycConsentsModule,
      providers: [
        { provide: BASE_API_URL, useValue: baseApiUrl },
        { provide: AbstractConsentsConnectorService, useClass: connectorService }
      ]
    };
  }
}

