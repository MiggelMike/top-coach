import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, DecimalPipe } from '@angular/common';
import { MatExpansionModule } from "@angular/material/expansion";
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs"; 
import { MatNativeDateModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card";
import { MatSliderModule } from "@angular/material/slider";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { BodyweightComponent } from './bodyweight.component';
import { ToolBarModule } from '../bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  DateRange,
  DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatRangeDateSelectionModel
} from "@angular/material/datepicker";
import { KalenderModule } from '../bausteine/Kalender/kalender/kalender.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [BodyweightComponent],
  exports: [BodyweightComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
      {
        provide: { MAT_DATE_RANGE_SELECTION_STRATEGY, MatRangeDateSelectionModel, DateRange },     
        useClass: DefaultMatCalendarRangeStrategy
      },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }
    ,{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
		,{ provide: LOCALE_ID, useValue: 'de-DE' }
    ,{
			provide: DATE_PIPE_DEFAULT_OPTIONS,
			useValue: { dateFormat: 'short' }
    },
    DatePipe
  ],
  imports: [
    DragDropModule,
    KalenderModule,
    BrowserAnimationsModule,
    DatePipe,
    FormsModule,
    CommonModule,
    DecimalPipe,
    MatExpansionModule,
    FlexLayoutModule,
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
    MatDatepickerModule,
    MatCardModule,
    MatSliderModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ToolBarModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule
    
  ]
})
export class BodyweightModule { }
