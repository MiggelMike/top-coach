import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "./../../services/global.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ITrainingsProgramm } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { SessionStatus } from "src/Business/Session/Session";

@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() showButtons: boolean | false;
    @Input() programmtext: { value: null };

    constructor(
        private fGlobalService: GlobalService,
        private fDialogeService: DialogeService
    ) {}

    ngOnInit() { }
    
    SelectThisWorkoutClick($event: any): void {
        $event.stopPropagation();
        // Soll das aktuelle Work-Out durch ein anderes ersetzt werden?
        if (
            this.fGlobalService.Daten.AktuellesProgramm.Programm !== undefined
        ) {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push(
                `Replace current Program "${this.fGlobalService.Daten.AktuellesProgramm.Programm.Name}" with "${this.programm.Name}" ?`
            );
            mDialogData.OkData = this.programm;
            mDialogData.OkFn = () => {
                this.fGlobalService.SetzeAktuellesProgramm(mDialogData.OkData);
            };

            this.fDialogeService.JaNein(mDialogData);
        } else {
            this.fGlobalService.SetzeAktuellesProgramm(this.programm);
        }
    }

    EditThisWorkoutClick($event): void {
        $event.stopPropagation();
        this.fGlobalService.EditWorkout = this.programm;
        this.fGlobalService.EditWorkout.SessionListe.forEach(
            (sess) => (sess.Kategorie01 = SessionStatus.Bearbeitbar)
        );
    }



  
}
