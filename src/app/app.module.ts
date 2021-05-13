import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService } from './services/dexie-svc.service';
import { MatCardModule } from '@angular/material/card';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { AppRoutingModule } from './app-routing.module';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material';
import { MatCheckboxModule } from "@angular/material/checkbox"; 

import { ProgrammWaehlenComponent } from './programm-waehlen/programm-waehlen.component';
import { Programm01Component } from './bausteine/programm01/programm01.component';
import { Programm02Component } from './bausteine/programm02/programm02.component';
import { Programm03Component } from './bausteine/programm03/programm03.component';
import { ProgrammLadeDirective } from './AppDirectives';
import { DialogComponent } from './dialoge/hinweis/hinweis.component';

import { OverlayModule } from '@angular/cdk/overlay';
import { FilePreviewOverlayComponent } from './file-preview-overlay/file-preview-overlay.component';
import { FilePreviewOverlayService } from './services/file-preview-overlay.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SatzSimpleComponent } from './bausteine/satz-simple/satz-simple.component';
import { SessionFormComponent } from './bausteine/session-form/session-form.component';
import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
import { SatzEditComponent } from './bausteine/satz-edit/satz-edit.component';
import { TextMaskModule } from 'angular2-text-mask';
import  createNumberMask  from 'text-mask-addons/dist/createNumberMask';
import { SatzComponent } from './bausteine/satz/satz.component';
import { SessUebungComponent } from './bausteine/sess-uebung/sess-uebung.component';
import { UebungWaehlenComponent } from './uebung-waehlen/uebung-waehlen.component';
import { RouterModule } from '@angular/router';
import { routes } from "./app-routing.module";
import { SessionComponent } from './bausteine/session/session.component';
// import { CanDeactivateGuard } from 'src/app/can-deactivate-guard';


// var sqlite3 = require('sqlite3');1

//export const Firstmask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
export const Firstmask = [/[0-9,'.', [0-9, [0-9,'.']]] /];

export const floatMask = createNumberMask({
    prefix: '',
    suffix: '', // This will put the dollar sign at the end, with a space.
    includeThousandsSeparator: true, //  (boolean): whether or not to separate thousands. Defaults to to true.
    integerLimit: 3, // (number): limit the length of the integer number. Defaults to null for unlimited
    allowDecimal: true, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
    decimalLimit: 3,
    // requireDecimal: true,
    // allowLeadingZeroes: true
  })

  export const repMask = createNumberMask({
    prefix: '',
    suffix: '', // This will put the dollar sign at the end, with a space.
    includeThousandsSeparator: false, //  (boolean): whether or not to separate thousands. Defaults to to true.
    integerLimit: 3, // (number): limit the length of the integer number. Defaults to null for unlimited
    allowDecimal: false, // (boolean): whether or not to allow the user to enter a fraction with the amount. Default to false.
  })


@NgModule({
    declarations: [
        AppComponent,
        AnstehendeSessionsComponent,
        ProgrammWaehlenComponent,
        Programm01Component,
        Programm02Component,
        Programm03Component,
        ProgrammLadeDirective,
        DialogComponent,
        FilePreviewOverlayComponent,
        SatzSimpleComponent,
        SessionFormComponent,
        WorkoutFormComponent,
        SatzEditComponent,
        SatzComponent,
        SessUebungComponent,
        UebungWaehlenComponent,
        SessionComponent
    ],
    imports: [
        RouterModule.forRoot(routes),
        TextMaskModule,
        MatCheckboxModule,
        MatCardModule,
        FlexLayoutModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatSliderModule,  
        MatToolbarModule,
        MatExpansionModule,
        MatMenuModule,
        AppRoutingModule,
        BsDropdownModule,
        MatIconModule,
        MatSidenavModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        FormsModule,
        MatDialogModule,
        OverlayModule,
        ReactiveFormsModule,
        DexieSvcService

    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ],

    exports: [],

    entryComponents: [
        DialogComponent,
        FilePreviewOverlayComponent,
        UebungWaehlenComponent
    ],
    providers: [MatDialog, FilePreviewOverlayService, DexieSvcService],
    bootstrap: [AppComponent]
})  
    
    
export class AppModule {
    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(public pDexieSvc: DexieSvcService) {
        // this.pDexieSvc.LadeProgramme().then(
        //     () => {
        //         this.ProgrammListe = this.pDexieSvc.Programme;
        //     }
        // )
    }

}




