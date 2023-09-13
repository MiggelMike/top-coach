import { SessionParaDB  } from 'src/app/services/dexie-svc.service';
import { DexieSvcService, cSessionSelectLimit } from './../../services/dexie-svc.service';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TrainingsProgramm, ITrainingsProgramm } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { Router } from '@angular/router';
import { ProgramModulTyp } from 'src/app/app.module';


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
    @Input() ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein;

   // StandardProgramme: Array<ITrainingsProgramm>;

    SelectBtnDisabled: boolean = false;

    constructor(
        private fDbModul: DexieSvcService,
        public fDialogService: DialogeService,
        private router: Router
    ) {}

    ngOnInit() {
    }
    
    private SelectWorkout(aSelectedProgram: ITrainingsProgramm) {
        this.fDbModul.RefreshAktuellesProgramm = true;
        this.router.navigate(["app-initial-weight"], { state: { Program: aSelectedProgram } });
    }

    private LadeSessions(aSessionLadePara?: SessionParaDB) : Promise<void> {
        return this.fDbModul.LadeProgrammSessions(this.programm.id, aSessionLadePara)
            .then((aSessionListe) => {
                if (aSessionListe.length > 0) {
                    this.programm.SessionListe = this.programm.SessionListe.concat(aSessionListe);
                    const mSessionLadePara: SessionParaDB = new SessionParaDB();
                    mSessionLadePara.Limit = cSessionSelectLimit;
                    mSessionLadePara.OffSet = aSessionListe.length;
                    this.LadeSessions(mSessionLadePara);
                }
            });
    }

    panelOpened() {
        this.programm.Expanded = true;
        this.fDbModul.CheckSessions(this.programm);
    }

    panelClosed() {
        this.programm.Expanded = false;
    }
    
    SelectThisWorkoutClick(aSelectedProgram: ITrainingsProgramm, $event: any): void {
        this.SelectBtnDisabled = false;
        $event.stopPropagation();
        this.fDbModul.FindAktuellesProgramm()
        .then((p) => {
                if (p.find( (prog) => prog.FkVorlageProgramm === aSelectedProgram.id ) !== undefined ) {
                    const mDialogData = new DialogData();
                    mDialogData.hasBackDrop = true;
                    mDialogData.textZeilen.push("The program is already chosen!");
                    mDialogData.textZeilen.push("Do want to add it anyway?");
                    mDialogData.OkFn = (): void => {
                        p.forEach((pr) =>
                            this.fDbModul.DeleteProgram(pr as TrainingsProgramm)
                        );
                        this.SelectWorkout(aSelectedProgram);
                    }

                    mDialogData.CancelFn = (): void => {
                        this.SelectBtnDisabled = false;
                     }            

                    this.fDialogService.JaNein(mDialogData);
                } else {
                    this.SelectWorkout(aSelectedProgram);
                }
            });
        }
   

    EditThisWorkoutClick($event): void {
        $event.stopPropagation();
        this.router.navigate(["/workoutform"], { state: { programm: this.programm } });
    }
}
