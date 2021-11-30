import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {}

    NavExercise(): void {
        this.router.navigate(["/exercise"]);
    }

    NavBodyweight(): void {
        alert("Bodyweight - Noch nicht fertig");
        // this.router.navigate(['/exercise']);
    }

    NavMuscleGroups(): void {
        this.router.navigate(['/muscle-groups']);
    }

    NavScheiben(): void {
        this.router.navigate(['/app-scheiben']);
    }

    NavBarbells() {
        this.router.navigate(['/langhantel']);
    }

    NavWeightIncrement(){
        this.router.navigate(['/app-trainings-gewicht-progress']);
    }
}
