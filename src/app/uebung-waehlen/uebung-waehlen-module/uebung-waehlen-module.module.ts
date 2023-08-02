import { UebungWaehlenComponent } from './../uebung-waehlen.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [UebungWaehlenComponent],
  exports: [UebungWaehlenComponent],
  imports: [
     FormsModule
    ,CommonModule]
})

export class UebungWaehlenModule { }
