import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ToolBarModule } from '../bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InitialWeightComponent } from './initial-weight.component';

const routes: Routes = [{ path: 'app-initial-weight', component: InitialWeightComponent }];

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
    // ToolBarModule,
    // FlexLayoutModule,
    // MatFormFieldModule,
    // MatInputModule,
    // MatRippleModule,

    // MatExpansionModule,
    // FlexLayoutModule,
    // MatInputModule,
    // MatFormFieldModule,
    // MatRippleModule,
    // MatCheckboxModule,
    // MatRadioModule,
    // MatMenuModule,
    // MatSidenavModule,
    // MatSelectModule,
    // MatTabsModule,
    // MatNativeDateModule,
    // MatCardModule,
    // MatSliderModule,
    // MatToolbarModule,
    // MatIconModule,
    // MatButtonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class InitialWeightModule { }
