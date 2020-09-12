import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent implements OnInit {
    programm: ITrainingsProgramm;

    constructor(
        private fGlobalService: GlobalService
    ) {}

    ngOnInit() {
        this.programm = this.fGlobalService.EditWorkout;
    }



}
