import { ProgrammWaehlenComponent } from './programm-waehlen.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { Programm01Module } from '../bausteine/programm01/programm01Md/programm01.module';
import { ToolBarModule } from '../bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { MatExpansionModule } from "@angular/material/expansion";

const routes: Routes = [{ path: '', component: ProgrammWaehlenComponent  }];

@NgModule({
  declarations: [ProgrammWaehlenComponent],
  exports: [RouterModule],
  imports: [
    CommonModule,
    FormsModule,
    Programm01Module,
    RouterModule.forChild(routes),
    ToolBarModule,
    MatExpansionModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ProgrammWaehlenModule { }
