import { Component, OnInit, Input } from '@angular/core';

import { ITrainingsProgramm } from '../../../Business/TrainingsProgramm/TrainingsProgramm';

@Component({
  selector: 'app-programm02',
  templateUrl: './programm02.component.html',
  styleUrls: ['./programm02.component.scss']
})
export class Programm02Component implements OnInit {
   @Input() programm: ITrainingsProgramm;

  constructor() { }

  ngOnInit() {
  }

}
