import { DialogeService } from './../../services/dialoge.service';
import { DialogData } from '../../dialoge/hinweis/hinweis.component';
import { GlobalService } from './../../services/global.service';
import { Component, OnInit, Input } from '@angular/core';
import { ITrainingsProgramm } from '../../../Business/TrainingsProgramm/TrainingsProgramm';

@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() programmtext: { value: null };

    constructor(
        private flobalService: GlobalService,
        private fDialogeService: DialogeService
    ) {}

    ngOnInit() {}

    SelectThisWorkoutClick(): void {
        // Soll das aktuelle Work-Out durch ein anderes ersetzt werden?
        if (this.flobalService.Daten.AktuellesProgramm.Programm !== undefined) {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push(
                `Replace current Program "${this.flobalService.Daten.AktuellesProgramm.Programm.Name}" with "${this.programm.Name}" ?`
            );
            mDialogData.OkData = this.programm;
            mDialogData.OkFn = () => {
                this.flobalService.SetzeAktuellesProgramm(mDialogData.OkData);
            };

            this.fDialogeService.JaNein(mDialogData);
        } else {
            this.flobalService.SetzeAktuellesProgramm(this.programm);
        }
    }

    EditThisWorkoutClick(): void { 
        this.flobalService.EditWorkout = this.programm;
    }
}
