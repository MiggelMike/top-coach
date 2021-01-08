import { ISatz } from './../../../Business/Satz/Satz';
import { IUebung } from './../../../Business/Uebung/Uebung';
import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { ISession } from 'src/Business/Session/Session';


@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent extends ComponentCanDeactivate implements OnInit  {
    public programm: ITrainingsProgramm;
    private cmpProgramm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService
    ) {
        super();
    }

    canDeactivate($event: Event): boolean {
        if (this.programm.hasChanged(this.cmpProgramm) === false) {
            return true;
        } else {
            return false;
        }
        // if (confirm("You have unsaved changes! If you leave, your changes will be lost.") === true ) {
        //     return true;
        // } else {
        //     return false;
        // }
    }


    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
        this.cmpProgramm = this.fGlobalService.EditWorkout.Copy();
    }
}

