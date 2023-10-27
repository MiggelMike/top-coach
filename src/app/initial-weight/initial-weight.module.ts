import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { InitialWeightComponent } from './initial-weight.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

//const routes: Routes = [{ path: 'app-initial-weight', component: InitialWeightComponent }];

@NgModule({
  declarations: [InitialWeightComponent],
  exports: [InitialWeightComponent],
  imports: [
    CommonModule,
    FormsModule,
  //  RouterModule.forChild(routes),
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatRippleModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class InitialWeightModule { }
