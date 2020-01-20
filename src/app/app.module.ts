import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule  } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';

@NgModule({
  declarations: [
    AppComponent,
    AnstehendeSessionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatToolbarModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
