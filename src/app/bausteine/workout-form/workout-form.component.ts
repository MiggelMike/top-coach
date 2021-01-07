import { CanDeactivateGuard } from 'src/app/can-deactivate-guard';
import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CanDeactivate } from '@angular/router';


@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent extends ComponentCanDeactivate implements OnInit  {
    programm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService
    ) {
        super();
    }

    canDeactivate(): boolean {
        if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
            return true;
        } else {
            return false;
        }
    }


    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
    }
}

