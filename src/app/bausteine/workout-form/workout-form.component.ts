import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormCanDeactivate } from 'src/app/form-can-deactivate';
import { NgForm } from "@angular/forms";



@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent extends FormCanDeactivate implements OnInit {
    programm: ITrainingsProgramm;

    @ViewChild('form') form: NgForm;

    constructor(
        private fGlobalService: GlobalService

    ) {
        super();
    }

    submit(){
        console.log(this.form.submitted);
       }

    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
    }
}

