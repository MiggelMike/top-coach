import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingsProgrammSvc } from './../../app/services/trainings-programm-svc.service';



@NgModule({
  imports:      [ CommonModule ],
  declarations: [ TrainingsProgrammSvc ],
  exports:      [ TrainingsProgrammSvc ]
})
  
export class TrainingServiceModule {
  constructor (@Optional() @SkipSelf() parentModule?: TrainingServiceModule) {
    if (parentModule) {
      throw new Error(
        'TrainingServiceModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: TrainingServiceModule): ModuleWithProviders {
    return {
      ngModule: TrainingServiceModule,
      providers: [
        {provide: TrainingsProgrammSvc, useValue: config }
      ]
    };
  }
}