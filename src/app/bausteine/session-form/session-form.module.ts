import { SessionFormComponent } from './session-form.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { Programm01Module } from '../programm01/programm01Md/programm01.module';
import { Programm02Module } from '../programm02/programm02Md/programm02.module';
import { Programm03Module } from '../programm03/programm03Md/programm03.module';
import { ToolBarModule } from '../toolbar/tool-bar-module/tool-bar-module.module';



const routes: Routes = [{ path: 'sessionFormComponent', component: SessionFormComponent }];

@NgModule({
  declarations: [SessionFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    Programm01Module,
    Programm02Module,
    Programm03Module,
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
    MatIconModule
    
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SessionFormModule { }
