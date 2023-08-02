import { ProgrammWaehlenComponent } from './programm-waehlen.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Programm01Module } from '../bausteine/programm01/programm01Md/programm01.module';
// import { ToolBarModule } from '../bausteine/toolbar/tool-bar-module/tool-bar-module.module';

@NgModule({
  // declarations: [ProgrammWaehlenComponent],
  // exports: [ProgrammWaehlenComponent],
  imports: [
    CommonModule,
    FormsModule,
    Programm01Module
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ProgrammWaehlenModule { }
