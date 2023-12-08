import { AppData, GewichtsEinheit } from './../../Business/Coach/Coach';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
    public get AppData() :AppData{
        return DexieSvcService.AppRec;
    }

    constructor(
        private fDbModule: DexieSvcService,
        private fDialogService: DialogeService,
        private router: Router)
    {}

    ngOnInit(): void { }

    //#region KG
    get KG(): boolean {
        if((this.AppData !== undefined)&&(this.AppData.GewichtsEinheit !== undefined))
            return this.AppData.GewichtsEinheit === GewichtsEinheit.KG;
        return false;
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

    ResetDatabase() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("This will delete all data of the database!");
        mDialogData.textZeilen.push("Do you really want to do that?");
        // mDialogData.ShowAbbruch = true;
    
        mDialogData.OkFn = () => {
            this.fDbModule.ResetDatenbank();
        }

        this.fDialogService.JaNein(mDialogData);
    }


    NavExercise(): void {
        this.router.navigate(["/exercise"]);
    }

    NavBodyweight(): void {
        this.router.navigate(['/app-bodyweight']);
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
