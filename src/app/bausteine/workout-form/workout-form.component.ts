import { Router } from '@angular/router';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';


@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent implements OnInit  {
    public programm: ITrainingsProgramm;
    public cmpProgramm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService,
        private router: Router,
        private fDialogService: DialogeService,
    ) {
        pogramm muss übergeben werden
    }

    CopyProgramm(aProgramm: ITrainingsProgramm) {
        this.cmpProgramm = aProgramm.Copy();    
    }

    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
        if(this.fGlobalService.EditWorkout)
            this.cmpProgramm = this.fGlobalService.EditWorkout.Copy();
    }

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

