import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
import { ProgrammWaehlenComponent } from './programm-waehlen/programm-waehlen.component';
import { Programm01Component } from './bausteine/programm01/programm01.component';
import { Programm02Component } from './bausteine/programm02/programm02.component';
import { Programm03Component } from './bausteine/programm03/programm03.component';
import { ProgrammLadeDirective } from './AppDirectives';

@NgModule({
    declarations: [
        AppComponent,
        AnstehendeSessionsComponent,
        ProgrammWaehlenComponent,
        Programm01Component,
        Programm02Component,
        Programm03Component,
        ProgrammLadeDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatSliderModule,
        MatToolbarModule,
        MatExpansionModule,
        MatMenuModule,
        AppRoutingModule,
        BsDropdownModule,
        MatIconModule,
        MatSidenavModule

    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
