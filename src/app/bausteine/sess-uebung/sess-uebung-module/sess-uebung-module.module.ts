import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SatzEditModule } from '../../satz-edit/satz-edit-module/satz-edit-module.module';
import { SessUebungComponent  } from './../sess-uebung.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatExpansionModule } from "@angular/material/expansion";
import { SatzSimpleModule } from '../../satz-simple/satz-simple.module';



@NgModule({
  declarations: [SessUebungComponent],
  exports: [SessUebungComponent],
  imports: [
    FormsModule,
    CommonModule,
    SatzEditModule,
    SatzSimpleModule,
    MatExpansionModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})

export class SessUebungModule { }
