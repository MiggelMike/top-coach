import { AppData, GewichtsEinheit } from './../../Business/Coach/Coach';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';
import { GewichtsTyp } from 'src/Business/Konfiguration/Gewicht';

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
    public AppData: AppData;

    constructor(
        private fDbModule: DexieSvcService,
        private router: Router) {
        this.fDbModule.LadeAppData()
            .then((aAppData: AppData) => this.AppData = aAppData);
         }

    ngOnInit(): void { }

    //#region KG
    get KG(): boolean {
        return this.AppData.GewichtsEinheit === GewichtsEinheit.KG;
    }
    
    set KG(aValue: boolean) {
        if (aValue === true) 
            this.AppData.GewichtsEinheit = GewichtsEinheit.KG;
        else 
            this.AppData.GewichtsEinheit = GewichtsEinheit.LBS;
        
        this.fDbModule.AppDataSpeichern(this.AppData);
    }
    //#endregion
    //#region LBS
    get LBS(): boolean {
        return this.AppData.GewichtsEinheit === GewichtsEinheit.LBS;
    }
    
    set LBS(aValue: boolean) {
        if (aValue === true) 
            this.AppData.GewichtsEinheit = GewichtsEinheit.LBS;
        else
            this.AppData.GewichtsEinheit = GewichtsEinheit.KG;
        
        this.fDbModule.AppDataSpeichern(this.AppData);

    }
    //#endregion    


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
