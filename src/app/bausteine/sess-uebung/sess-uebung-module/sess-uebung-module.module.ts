import { CommonModule } from '@angular/common';
import { SatzEditModule } from '../../satz-edit/satz-edit-module/satz-edit-module.module';
import { SessUebungComponent  } from './../sess-uebung.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  declarations: [SessUebungComponent],
  exports: [SessUebungComponent],
  imports: [
    SatzEditModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})

export class SessUebungModule { }
