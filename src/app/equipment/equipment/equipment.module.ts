import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolBarModule } from 'src/app/bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { MatToolbarModule } from "@angular/material/toolbar";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ToolBarModule,
    MatToolbarModule
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})

export class EquipmentModule { }
