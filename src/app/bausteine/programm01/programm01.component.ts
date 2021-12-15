import { DexieSvcService, LadePara } from './../../services/dexie-svc.service';
import { GlobalService } from "./../../services/global.service";
import { Component, OnInit, Input } from "@angular/core";
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie, ProgrammTyp } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { SessionStatus } from '../../../Business/SessionDB';
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { Router } from '@angular/router';


@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() showButtons: boolean | false;
    @Input() showSaveButtons: boolean | false;
    @Input() programmtext: { value: null };

    constructor(
        private fGlobalService: GlobalService,
        private fDbModul: DexieSvcService,
        public fDialogService: DialogeService,
        private router: Router
    ) {}

    ngOnInit() { }

    private SelectWorkout(aSelectedProgram: ITrainingsProgramm) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Do want to set initial weights?");
        mDialogData.OkFn = (): void => {
           this.router.navigate(["/app-initial-weight"], { state: { Program: aSelectedProgram } });
        }

        mDialogData.CancelFn = (): void => {
            this.fDbModul.SetAktuellesProgramm(aSelectedProgram as TrainingsProgramm)
                .then(() =>  this.router.navigate([""]) );
         }
         this.fDialogService.JaNein(mDialogData);
    }

    SelectThisWorkoutClick(aSelectedProgram: ITrainingsProgramm, $event: any): void {
        $event.stopPropagation();
        this.fDbModul.FindAktuellesProgramm()
            .then((p) => {
                if (p.find( (prog) => prog.FkVorlageProgramm === aSelectedProgram.id ) !== undefined ) {
                    const mDialogData = new DialogData();
                    mDialogData.textZeilen.push("The program is already chosen!");
                    mDialogData.textZeilen.push("Do want to add it anyway?");
                    mDialogData.OkFn = (): void => {
                        p.forEach((pr) =>
                            this.fDbModul.DeleteProgram(pr as TrainingsProgramm)
                        );
                        this.SelectWorkout(aSelectedProgram);
                    }
                    this.fDialogService.JaNein(mDialogData);
                } else {
                    this.SelectWorkout(aSelectedProgram);
                }
            });
    }

    EditThisWorkoutClick($event): void {
        $event.stopPropagation();
        this.fGlobalService.EditWorkout = this.programm;
        if (this.fGlobalService.EditWorkout.SessionListe)
            this.fGlobalService.EditWorkout.SessionListe.forEach(
                (sess) => (sess.Kategorie01 = SessionStatus.Bearbeitbar)
            );
    }
}
