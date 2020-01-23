import { Component, OnInit, Input } from '@angular/core';
import { ITrainingsProgramm } from '../../../Business/TrainingsProgramm/TrainingsProgramm';
import { Programm02Component } from '../programm02/programm02.component';

@Component({
  selector: 'app-programm01',
  templateUrl: './programm01.component.html',
  styleUrls: ['./programm01.component.scss']
})


export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;

    constructor() { }

    ngOnInit() {
    }

}
