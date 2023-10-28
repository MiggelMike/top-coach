import { AnstehendeSessionsComponent } from './../anstehende-sessions.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Programm01Module } from 'src/app/bausteine/programm01/programm01Md/programm01.module';
import { CommonModule } from '@angular/common';
import { ToolBarModule } from 'src/app/bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { Programm02Module } from 'src/app/bausteine/programm02/programm02Md/programm02.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Programm03Module } from 'src/app/bausteine/programm03/programm03Md/programm03.module';
import { SessUebungModule } from 'src/app/bausteine/sess-uebung/sess-uebung-module/sess-uebung-module.module';



const routes: Routes = [{ path: '', component: AnstehendeSessionsComponent }];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    Programm01Module,
    Programm02Module,
    Programm03Module,
    SessUebungModule,
    ToolBarModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatMenuModule,
    MatSidenavModule,
    MatSelectModule,
    MatTabsModule,
    MatNativeDateModule,
    MatCardModule,
    MatSliderModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AnstehendeSessionsModule { }
