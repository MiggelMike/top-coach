import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Router } from '@angular/router';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';


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
        private fDbModule: DexieSvcService
    ) {
        const mNavigation = this.router.getCurrentNavigation()!;
        const mState = mNavigation.extras.state as { programm: ITrainingsProgramm, ModulTyp: ProgramModulTyp };
        this.programm = mState.programm;
        this.ModulTyp = mState.ModulTyp;
        this.fDbModule.CheckSessions(this.programm);
        this.cmpProgramm = mState.programm.Copy();
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }

    
    CopyProgramm(aProgramm: ITrainingsProgramm) {
        this.cmpProgramm = aProgramm.Copy();    
    }

    ngOnInit() {}

    CancelChanges(aPara: WorkoutFormComponent, aNavRoute: string) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            aPara.programm.resetProgram(aPara.cmpProgramm);
            this.router.navigate([aNavRoute] );
        };

        this.fDialogService.JaNein(mDialogData);
    }


    leave(aNavPath: string, aPara: any) {
        if (aPara.programm.hasChanged(aPara.cmpProgramm) === false) {
            this.router.navigate([aNavPath] );
        } else {
            aPara.CancelChanges(aPara, aNavPath);
        }
    }
}

