import { LanghantelComponent } from './langhantel.component';
import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from '@angular/material/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';


@NgModule({
  declarations: [LanghantelComponent],
  exports: [LanghantelComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatRippleModule,
    NgxMaskDirective,
    NgxMaskPipe
  ]
})

export class LanghantelModule { }
