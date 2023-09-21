import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipePipe } from './date-pipe.pipe';




@NgModule({
  declarations: [DatePipePipe],
  imports: [
    CommonModule
  ]
})
export class DatePipeModule { }
