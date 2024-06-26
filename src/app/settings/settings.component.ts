import { AppData, GewichtsEinheit } from './../../Business/Coach/Coach';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { GlobalService } from '../services/global.service';
import { AppComponent } from '../app.component';
let root = document.querySelector(":root");

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
    { }
    
    
    get Toolbar_1_row(): boolean {
		return GlobalService.calcToolbarRrows() === 1;
	}	

	get Toolbar_2_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 2;
	}

	get Toolbar_3_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 3;
	}    


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

        DexieSvcService.GewichtsEinheit = this.AppData.GewichtsEinheit;
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
        
        DexieSvcService.GewichtsEinheit = this.AppData.GewichtsEinheit;
        this.fDbModule.AppDataSpeichern(this.AppData);

    }
    //#endregion

    //#region Light
    get Light(): boolean {
            return this.AppData.isLightTheme;
    }

    set Light(aValue: boolean) {
        this.fDbModule.DoTheme(aValue);
    }
    //#endregion

    //#region Light
    get Dark(): boolean {
        return !this.AppData.isLightTheme;
    }

    set Dark(aValue: boolean) {
        this.fDbModule.DoTheme(!aValue);
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
