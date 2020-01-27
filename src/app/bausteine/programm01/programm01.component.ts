import { DialogeService } from './../../services/dialoge.service';
import { GlobalService } from './../../services/global.service';
import { Component, OnInit, Input } from '@angular/core';
import { ITrainingsProgramm } from '../../../Business/TrainingsProgramm/TrainingsProgramm';


@Component({
    selector: 'app-programm01',
    templateUrl: './programm01.component.html',
    styleUrls: ['./programm01.component.scss']
})



export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() programmtext: { value: null };

    constructor(private flobalService: GlobalService, private fDialogeService: DialogeService) {
    }

    ngOnInit() {
    }

    SelectThisWorkoutClick(): void {
        this.fDialogeService.Hinweis('xx');
        let mOk = (this.flobalService.AppData.AktuellesProgramm.Programm === undefined);
        if (!mOk) {
            mOk = false;
        }
        if (mOk) {
            this.flobalService.SetzeAktuellesProgramm(this.programm);
        }
    }

}
