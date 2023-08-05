import { AnstehendeSessionsComponent } from './../anstehende-sessions.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Programm01Module } from 'src/app/bausteine/programm01/programm01Md/programm01.module';
import { CommonModule } from '@angular/common';
import { ToolBarModule } from 'src/app/bausteine/toolbar/tool-bar-module/tool-bar-module.module';



const routes: Routes = [{ path: '', component: AnstehendeSessionsComponent }];

@NgModule({
  declarations: [AnstehendeSessionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    Programm01Module,
    ToolBarModule
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AnstehendeSessionsModule { }
