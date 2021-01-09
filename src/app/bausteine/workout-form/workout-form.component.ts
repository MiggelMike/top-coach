import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";




@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent extends ComponentCanDeactivate implements OnInit  {
    public programm: ITrainingsProgramm;
    private cmpProgramm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService,
    ) {
        super();
    }

    canDeactivate($event: Event):Boolean {
        if (this.programm.hasChanged(this.cmpProgramm) === false) 
            return true;
        return false;
    }


    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
        this.cmpProgramm = this.fGlobalService.EditWorkout.Copy();
    }
}

