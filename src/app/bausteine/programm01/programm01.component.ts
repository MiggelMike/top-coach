import { SessionParaDB  } from 'src/app/services/dexie-svc.service';
import { DexieSvcService, cSessionSelectLimit } from './../../services/dexie-svc.service';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TrainingsProgramm, ITrainingsProgramm, IProgrammTyp, ProgrammTyp } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { Router } from '@angular/router';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';
import { NoAutoCreateItem } from 'src/Business/NoAutoCreate';


@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit, IProgramModul, IProgrammTyp {
    @Input() programm: ITrainingsProgramm;
    @Input() showButtons: boolean | false;
    @Input() showSaveButtons: boolean | false;
    @Input() programmtext: { value: null };
    ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein;

    SelectBtnDisabled: boolean = false;

    constructor(
        private fDbModul: DexieSvcService,
        public fDialogService: DialogeService,
        private router: Router
    ) {
        this.ModulTyp = DexieSvcService.ModulTyp;
    }
    get programmTyp(): typeof ProgrammTyp {
        return ProgrammTyp;
    }

    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }

    DeleteProgramm(aEvent: Event,aProgramm: ITrainingsProgramm) {
        aEvent.stopPropagation();
        const mDialogData = new DialogData();
        mDialogData.hasBackDrop = true;
        mDialogData.textZeilen.push('Do you really want to delete "'+aProgramm.Name.trim()+ '"!');
        mDialogData.OkFn = (): void => {
            this.fDbModul.DeleteProgram(aProgramm as TrainingsProgramm)

            switch (aProgramm.ProgrammTyp) {
                case ProgrammTyp.Gzclp:
                    this.fDbModul.NoAutoCreateItemSpeichern(NoAutoCreateItem.GzclpProgram);
                    break;
                
                case ProgrammTyp.HypertrophicSpecific:
                    this.fDbModul.NoAutoCreateItemSpeichern(NoAutoCreateItem.HypertrophicSpecificProgram);
                    break;
            }//switch

            const mIndex = DexieSvcService.VerfuegbareProgramme.findIndex((mSuchProgramm) => { return mSuchProgramm === aProgramm; });
            
            if (mIndex > -1)
                DexieSvcService.VerfuegbareProgramme.splice(mIndex, 1);
            
        }

        mDialogData.CancelFn = (): void => {
            this.SelectBtnDisabled = false;
         }            

        this.fDialogService.JaNein(mDialogData); 
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        
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
                    mDialogData.textZeilen.push("Do want to select it anyway?");
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
        if (DexieSvcService.ModulTyp === ProgramModulTyp.SelectWorkout)
            DexieSvcService.ModulTyp = ProgramModulTyp.SelectWorkoutEdit;
        else
            DexieSvcService.ModulTyp = ProgramModulTyp.EditWorkout;

        this.router.navigate(["/workoutform"], { state: { programm: this.programm } });
    }
}
