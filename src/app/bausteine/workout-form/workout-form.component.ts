import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Router } from '@angular/router';
import { ITrainingsProgramm, TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';
import { Location } from "@angular/common";


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
        this.cmpProgramm = mState.programm.Copy();
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }

    
    CopyProgramm(aProgramm: ITrainingsProgramm) {
        this.cmpProgramm = aProgramm.Copy();    
    }

    ngOnInit() { 
        this.ModulTyp = DexieSvcService.ModulTyp;
    }

    
    public back() {
		if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
		
			mDialogData.OkFn = () => {
				this.SaveChangesPrim();
				this.leave();
			}
	
			mDialogData.CancelFn = (): void => {
				this.leave();
			}
	
			this.fDialogService.JaNein(mDialogData);
		}
	}
    SaveChangesPrim() {
        this.fDbModule.ProgrammSpeichern(this.programm);
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

    leave() {
        //if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) {
            this.location.back();
        //} else {
           // this.CancelChanges();
        //}//
    }
}

