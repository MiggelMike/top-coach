import { SessionStatsOverlayComponent } from './session-stats-overlay.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Programm01Module } from '../bausteine/programm01/programm01Md/programm01.module';
import { Programm02Module } from '../bausteine/programm02/programm02Md/programm02.module';
import { Programm03Module } from '../bausteine/programm03/programm03Md/programm03.module';
import { ToolBarModule } from '../bausteine/toolbar/tool-bar-module/tool-bar-module.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import {CdkDrag} from '@angular/cdk/drag-drop';


const routes: Routes = [{ path: 'SessionStatsOverlay', component: SessionStatsOverlayComponent }];

@NgModule({
  declarations: [SessionStatsOverlayComponent],
  providers: [ {
    provide: DATE_PIPE_DEFAULT_OPTIONS,
    useValue: { dateFormat: 'short' }
  }],
  imports: [
    CdkDrag,
    NgxMaskDirective,
    NgxMaskPipe,
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
    MatIconModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatTreeModule,

    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    DatePipe
    
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})

export class SessionStatsOverlayModule { }
