import { ProgramCopyPara } from './../../services/dexie-svc.service';
import { DexieSvcService, ProgrammParaDB } from 'src/app/services/dexie-svc.service';
import { Router } from '@angular/router';
import { ITrainingsProgramm, ProgrammKategorie, TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';
import { Location } from "@angular/common";
import { promises } from 'dns';


@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent implements OnInit, IProgramModul  {
    public programm: ITrainingsProgramm;
    public cmpProgramm: ITrainingsProgramm;
    public ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein; 
    

    constructor(
        private router: Router,
        private fDialogService: DialogeService,
        private fDbModule: DexieSvcService,
        private location: Location
    ) {
        const mNavigation = this.router.getCurrentNavigation()!;
        const mState = mNavigation.extras.state as { programm: ITrainingsProgramm };
        this.programm = mState.programm;
        this.fDbModule.CheckSessions(this.programm);
        this.cmpProgramm = mState.programm.Copy(new ProgramCopyPara());
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }
    
    CopyProgramm(aProgramm: ITrainingsProgramm) {
        const mProgramCopyPara: ProgramCopyPara = new ProgramCopyPara();
        this.cmpProgramm = aProgramm.Copy(mProgramCopyPara);    
        if  (DexieSvcService.VerfuegbareProgramme.find((aSuchProgram) => { return aSuchProgram === aProgramm; }) === undefined) {
            DexieSvcService.VerfuegbareProgramme.push(aProgramm);
            // TrainingsProgramm.SortByName(DexieSvcService.VerfuegbareProgramme);
        }
    }

    ngOnInit() { 
        this.ModulTyp = DexieSvcService.ModulTyp;
    }

    get MediaWidth(): number{
        return window.innerWidth;
    }
    
    public back() {
		if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
		
            mDialogData.OkFn = () => {
                this.SaveChangesPrim(() => { this.leave(); });
			}
	
            mDialogData.CancelFn = (): void => {
				if (this.programm.ProgrammKategorie === ProgrammKategorie.Vorlage) {
					const mIndex = DexieSvcService.VerfuegbareProgramme.findIndex((p) => p.id === this.programm.id);
					if (mIndex > -1) {
						DexieSvcService.VerfuegbareProgramme[mIndex] = this.cmpProgramm;
					}
				}

				this.leave();
			};
	
			this.fDialogService.JaNein(mDialogData);
		}
    }
    
    SaveChangesPrim(aOkFn: any) {
        const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
        mProgrammExtraParaDB.OnAfterSaveFn = (aProgram: TrainingsProgramm) => {
            this.CopyProgramm(aProgram)
            aOkFn();
        };
        return this.fDbModule.ProgrammSpeichern(this.programm, mProgrammExtraParaDB);
    }

    CancelChanges() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            this.programm.resetProgram(this.programm);
            this.leave();
        };

        this.fDialogService.JaNein(mDialogData);
    }

    private doneLeave: boolean = false;
    leave() {
        //if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) {
        if (this.doneLeave === false) {
            this.doneLeave = true;
            this.location.back();
        }
        //} else {
           // this.CancelChanges();
        //}//
    }
}

