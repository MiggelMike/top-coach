import { Component, OnInit, Input } from '@angular/core';
import { ITrainingsProgramm } from '../../../Business/TrainingsProgramm/TrainingsProgramm';
import { GlobalData } from '../../services/global.service';


@Component({
  selector: 'app-programm01',
  templateUrl: './programm01.component.html',
  styleUrls: ['./programm01.component.scss']
})



export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() programmtext: { value: null };

    constructor() {
    }

    ngOnInit() {
    }

    SelectThisWorkoutClick(): void {
        if (GlobalData.AppData.AktuellesProgramm.Programm !== null) {

        }
        let x = 0;
        x++;
    }

}
