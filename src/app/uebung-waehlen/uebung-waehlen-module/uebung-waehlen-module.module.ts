import { UebungWaehlenComponent } from './../uebung-waehlen.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import {CdkDrag} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [UebungWaehlenComponent],
  exports: [UebungWaehlenComponent],
  imports: [
    CdkDrag,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    CommonModule]
})

export class UebungWaehlenModule { }
