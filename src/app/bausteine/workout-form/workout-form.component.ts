import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";




@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent extends ComponentCanDeactivate implements OnInit  {
    public programm: ITrainingsProgramm;
    public cmpProgramm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService,
    ) {
        super();
    }

    canDeactivate($event: Event): Boolean {
        if (this.programm.hasChanged(this.cmpProgramm) === true) {
            $event.stopPropagation();
            return false;
        }
        return true;
    }

    CopyProgramm(aProgramm: ITrainingsProgramm) {
        this.cmpProgramm = aProgramm.Copy();    
    }


    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
        if(this.fGlobalService.EditWorkout)
            this.cmpProgramm = this.fGlobalService.EditWorkout.Copy();
    }
}

