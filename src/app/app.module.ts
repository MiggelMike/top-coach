import { SatzSimpleModule } from './bausteine/satz-simple/satz-simple.module';
import { ProgrammWaehlenModule } from './programm-waehlen/programm-waehlen.module';
import { PlateCalcModule } from "./plate-calc/plate-calc-module/plate-calc-module.module";
import { StoppUhrModuleModule } from "./stoppuhr/stopp-uhr-module/stopp-uhr-module.module";
import { SatzEditModule } from "./bausteine/satz-edit/satz-edit-module/satz-edit-module.module";
import { SessUebungModule } from './bausteine/sess-uebung/sess-uebung-module/sess-uebung-module.module';
import { EditExerciseModule } from './edit-exercise/edit-exercise-module/edit-exercise-module.module';
import { ExerciseSettingsModule } from './exercise-settings/exercise-settings-module/exercise-settings-module.module';
// import { ToolBarModuleModule } from './bausteine/test/test.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MatCardModule } from "@angular/material/card";
import { MatSliderModule } from "@angular/material/slider";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatAccordion, MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatNativeDateModule } from "@angular/material/core";
// import { Router, NavigationStart } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SatzSimpleComponent } from '../app/bausteine/satz-simple/satz-simple.component'
// import { Programm01Component } from "./bausteine/programm01/programm01.component";
// import { Programm02Component } from "./bausteine/programm02/programm02.component";
// import { Programm03Component } from "./bausteine/programm03/programm03.component";
// import { SatzComponent } from "./bausteine/satz/satz.component";
// import { SatzEditComponent } from "./bausteine/satz-edit/satz-edit.component";
// import { SatzSimpleComponent } from "./bausteine/satz-simple/satz-simple.component";
// import { SessUebungComponent } from "./bausteine/sess-uebung/sess-uebung.component";
// import { SessionFormComponent } from "./bausteine/session-form/session-form.component";
// import { WorkoutFormComponent } from "./bausteine/workout-form/workout-form.component";
// import { UebungWaehlenComponent } from "./uebung-waehlen/uebung-waehlen.component";
// import { StoppuhrComponent } from "./stoppuhr/stoppuhr.component";
import { SessionStatsOverlayComponent } from "./session-stats-overlay/session-stats-overlay.component";
// import { PlateCalcComponent } from "./plate-calc/plate-calc.component";
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
// import { TextMaskModule } from 'angular2-text-mask';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from "./dialoge/hinweis/hinweis.component";
// import { OverlayModule } from '@angular/cdk/overlay';
// import { FilePreviewOverlayComponent  } from './file-preview-overlay/file-preview-overlay.component';
import { FilePreviewOverlayService } from './services/file-preview-overlay.service';
import { LOCALE_ID } from '@angular/core';
import { DatePipePipe } from './date-pipe.pipe';
import { DatePipe } from "@angular/common";
//import { ExerciseSettingsModuleModule } from

import {
	TranslateModule,
	TranslateLoader  } from '@ngx-translate/core';
// import { TestModule } from "./bausteine/test/test.component";
// import { ExerciseSettingsComponent } from "./exercise-settings/exercise-settings.component";
// import { EditExerciseComponent } from "./edit-exercise/edit-exercise.component";
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import { DexieSvcService } from "./services/dexie-svc.service";
import { MatDialog  } from '@angular/material/dialog';  
// import { HistoryComponent } from "./history/history.component";
// import { BodyweightComponent } from "./bodyweight/bodyweight.component";
// import { DataStoreButtonsComponent } from "./bausteine/data-store-buttons/data-store-buttons.component";
// import { SettingsComponent } from "./settings/settings.component";
// import { MuscleGroupsComponent } from "./muscle-groups/muscle-groups.component";
// import { LanghantelComponent } from "./langhantel/langhantel.component";
// import { TrainingsGewichtProgressComponent } from "./trainings-gewicht-progress/trainings-gewicht-progress.component";
// import { ScheibenComponent } from "./scheiben/scheiben.component";
// import { EditLanghantelComponent } from "./edit-langhantel/edit-langhantel.component";
// import { EditEquipmentComponent } from "./edit-equipment/edit-equipment.component";
// import { EditMuscleGroupComponent } from "./edit-muscle-group/edit-muscle-group.component";
// import { EditTrainingsGewichtProgressComponent } from "./edit-trainings-gewicht-progress/edit-trainings-gewicht-progress.component";
// import { InitialWeightComponent } from "./initial-weight/initial-weight.component";
// import { ExerciseComponent } from "./exercise/exercise.component";
import { ToolBarModule } from "./bausteine/toolbar/tool-bar-module/tool-bar-module.module";
import { DialogeService } from "./services/dialoge.service";
import { Programm01Module } from "./bausteine/programm01/programm01Md/programm01.module";
import { Programm02Module } from "./bausteine/programm02/programm02Md/programm02.module";
import { Programm03Module } from "./bausteine/programm03/programm03Md/programm03.module";
import { UebungWaehlenModule } from "./uebung-waehlen/uebung-waehlen-module/uebung-waehlen-module.module";
import { AnstehendeSessionsModule } from "./anstehende-sessions/anstehende-sessions/anstehende-sessions.module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkoutFormModule } from './bausteine/workout-form/workout-form.module';
import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
// import { InitialWeightModule } from './initial-weight/initial-weight.module';
import { InitialWeightComponent } from './initial-weight/initial-weight.component';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }
  
//   import { MatBadgeModule } from '@angular/material/m/MatBadgeModule';
  
  // import { CanDeactivateGuard } from 'src/app/can-deactivate-guard';
  
  
  // var sqlite3 = require('sqlite3');1
  
  //export const Firstmask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  export const Firstmask = [/[0-9,'.', [0-9, [0-9,'.']]] /];
  
  
  export interface IOkCallback {
	():void;
  }
  
  export interface ICancelCallback {
	():void;
}

export enum ProgramModulTyp {
	Kein,
	AnstehendeSessions,
	History

 }

export interface IProgramModul {
	get programModul(): (typeof ProgramModulTyp);
}


  
  export const floatMask = createNumberMask({
	  prefix: '',
	  suffix: '', 
	  includeThousandsSeparator: true, //  (boolean): whether or not to separate thousands. Defaults to to true.
	  integerLimit: 3, // (number): limit the length of the integer number. Defaults to null for unlimited
	  allowDecimal: true, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
	  decimalLimit: 3,
	  // requireDecimal: true,
	  // allowLeadingZeroes: true
	})
  
	export const repMask = createNumberMask({
	  prefix: '',
	  suffix: '', 
	  includeThousandsSeparator: false, //  (boolean): whether or not to separate thousands. Defaults to to true.
	  integerLimit: 3, // (number): limit the length of the integer number. Defaults to null for unlimited
	  allowDecimal: false, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
	})
  
	export const Int2DigitMask = createNumberMask({
	  prefix: '',
	  suffix: '', 
	  includeThousandsSeparator: false, //  (boolean): whether or not to separate thousands. Defaults to to true.
	  integerLimit: 2, // (number): limit the length of the integer number. Defaults to null for unlimited
	  allowDecimal: false, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
	})
  
	export const Int3DigitMask = createNumberMask({
	  prefix: '',
	  suffix: '', 
	  includeThousandsSeparator: false, //  (boolean): whether or not to separate thousands. Defaults to to true.
	  integerLimit: 3, // (number): limit the length of the integer number. Defaults to null for unlimited
	  allowDecimal: false, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
	})  
  
	export const Int4DigitMask = createNumberMask({
	  prefix: '',
	  suffix: '', 
	  includeThousandsSeparator: false, //  (boolean): whether or not to separate thousands. Defaults to to true.
	  integerLimit: 4, // (number): limit the length of the integer number. Defaults to null for unlimited
	  allowDecimal: false, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
	})    


@NgModule({
	declarations: [
		AppComponent
		// ,ToolbarComponent
		, AnstehendeSessionsComponent
		// ,ProgrammWaehlenComponent
		, DialogComponent
		, WorkoutFormComponent
		,InitialWeightComponent 
		

		//TestComponent
		// TestModule
		// ,ToolBarModuleModule
		// SatzComponent,
		// FilePreviewOverlayComponent,
		// SatzEditComponent,
		// SatzSimpleComponent,
		// SessUebungComponent,
		// SessionFormComponent,
		// OverlayModule,
		// WorkoutFormComponent,
		// UebungWaehlenComponent,
		// StoppuhrComponent,
		,SessionStatsOverlayComponent,
		// PlateCalcComponent,
		// ExerciseSettingsComponent,
		// EditExerciseComponent,
		// StoppuhrComponent,
		// PlateCalcComponent
		// StoppuhrComponent,
		// HistoryComponent,
		// BodyweightComponent,
		// DatePipePipe,
		// DataStoreButtonsComponent,
        // ToolbarComponent,
        // SettingsComponent,
        // ExerciseComponent,
        // EditExerciseComponent,
        // MuscleGroupsComponent,
        // EditMuscleGroupComponent,
        // EditEquipmentComponent,
        // EditEquipmentComponent,
        // LanghantelComponent,
        // EditLanghantelComponent,
        // ScheibenComponent,
        // TrainingsGewichtProgressComponent,
        // ExerciseSettingsComponent,
        // EditTrainingsGewichtProgressComponent,
        // InitialWeightComponent,
	
		
	],
	
	imports: [
		TranslateModule.forRoot({
			// defaultLanguage: 'en',
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		})
		,BrowserAnimationsModule
		,BrowserModule
		,AppRoutingModule
		,FormsModule
		,MatTabsModule
		,MatSidenavModule
		,MatSelectModule
		,MatMenuModule
		,FlexLayoutModule
		,MatCheckboxModule
		,MatRadioModule
		,MatNativeDateModule
		,MatToolbarModule		
		,MatSliderModule
		,IonicModule.forRoot()
		,DexieSvcService
		, EditExerciseModule
		
		
		
		//		,MatDatepickerModule
		// ,ToolbarComponent
		
		,MatCardModule
		,MatExpansionModule
		// ,BsDropdownModule
		,MatIconModule
		,MatButtonModule
		,MatFormFieldModule
		,MatInputModule
		, MatRippleModule
		, ToolBarModule
		, AnstehendeSessionsModule
		, Programm01Module
		, Programm02Module
		, Programm03Module
		, SessUebungModule
		,SatzEditModule
		 , RouterModule

		, DragDropModule
		,ScrollingModule
		,CdkTableModule
		, CdkTreeModule
		, WorkoutFormModule
		, SatzSimpleModule
		// ,InitialWeightModule
		

	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
	providers: [
		 MatDialog
		, FilePreviewOverlayService
		, DatePipePipe
		, DexieSvcService
		, DialogeService 
		,{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
		,{ provide: LOCALE_ID, useValue: 'de-DE' }
		, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
		// , { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance:  'outline' }}
	],
	bootstrap: [AppComponent],
	
	exports: [
		BrowserModule
		, MatExpansionModule
        ,MatRadioModule
		,MatTabsModule
		, MatCheckboxModule
		,MatAccordion
		
		// // MatDatepickerModule,
		// MatNativeDateModule,
		,MatSliderModule
		,MatToolbarModule
		//  BsDropdownModule,
		,MatIconModule
		,MatSidenavModule
		,MatButtonModule
		,MatFormFieldModule
		,MatInputModule
		,MatRippleModule
		,MatDialogModule
		,RouterModule
		,MatCardModule
		, Programm01Module
		,ProgrammWaehlenModule
		, Programm02Module
		, Programm03Module
		, UebungWaehlenModule
		, ExerciseSettingsModule
		, EditExerciseModule
		, SessUebungModule
		, WorkoutFormModule
		, SatzEditModule
		, DatePipe
		, StoppUhrModuleModule
		, PlateCalcModule
		// , ToolBarModule
		// , AnstehendeSessionsModule
		, FlexLayoutModule
		,BrowserAnimationsModule
	]


})
export class AppModule {}
