import { Programm03Component } from '../programm03.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from "@angular/material/expansion";
import { CommonModule, DatePipe } from "@angular/common";
import { SessUebungModule } from '../../sess-uebung/sess-uebung-module/sess-uebung-module.module';

@NgModule({
    declarations: [Programm03Component],
    exports: [Programm03Component],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    imports: [
        FormsModule,
        MatExpansionModule,
        SessUebungModule,
        CommonModule,
        DatePipe]
})
export class Programm03Module { }