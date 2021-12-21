import { Component, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { Router } from '@angular/router';

@Component({
    selector: "app-exercise",
    templateUrl: "./exercise.component.html",
    styleUrls: ["./exercise.component.scss"],
})
    
export class ExerciseComponent implements OnInit {
    

    constructor(private fDexieSvcService: DexieSvcService, private router: Router) {}

    ngOnInit(): void {}

    public get UebungListeSortedByName(): Array<Uebung> {
        return this.fDexieSvcService.UebungListeSortedByName;
    }

    public EditExercise(aUebung: Uebung): void {
        this.router.navigate(["/edit-exercise"], { state: { ueb: aUebung} });
    }

    public NewExercise():void {
        this.router.navigate(["/edit-exercise"], { state: { ueb: new Uebung()} });
    }
}
