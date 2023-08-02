import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Programm01Component } from '../programm01.component';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from "@angular/material/expansion";
import { Programm02Module } from '../../programm02/programm02Md/programm02.module';
import { CommonModule } from '@angular/common';
import { ToolBarModule } from '../../toolbar/tool-bar-module/tool-bar-module.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [Programm01Component],
  exports: [Programm01Component],
  imports: [
    FormsModule,
    MatExpansionModule,
    CommonModule,
    Programm02Module,
    ToolBarModule,
    FlexLayoutModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class Programm01Module { }
