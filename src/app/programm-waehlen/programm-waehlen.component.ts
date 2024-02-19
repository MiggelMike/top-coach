import { EigenesTrainingsProgramm } from './../../Business/EigenesTrainingsProgramm/EigenesTrainingsProgramm';
import { ProgrammKategorie, ProgrammTyp, TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { IProgramModul, ProgramModulTyp } from '../app.module';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit, IProgramModul  {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    ViewInitDone: boolean = false;
    get ProgrammListe(): Array<ITrainingsProgramm> {
        const p: Array<ITrainingsProgramm> = DexieSvcService.VerfuegbareProgramme;
        return DexieSvcService.VerfuegbareProgramme;
    };

    constructor(
        public fDbModule: DexieSvcService
        
    ) {
        DexieSvcService.ModulTyp = ProgramModulTyp.SelectWorkout;
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }
        
    ngOnInit() {
   
    }

    createWorkOut() {
        const mNeuesProgram: ITrainingsProgramm = new EigenesTrainingsProgramm(
            ProgrammTyp.Custom,
            ProgrammKategorie.Vorlage,
            this.fDbModule
        );

        TrainingsProgramm.createWorkOut(this.fDbModule, mNeuesProgram);
    }

    // drop(event: any) {
	// 	const mEvent = event as CdkDragDrop<ISession[]>;
		
	// 	this.ProgrammListe[event.previousIndex].ListenIndex = mEvent.currentIndex;
	// 	this.programm.SessionListe[event.currentIndex].ListenIndex = mEvent.previousIndex;
	// 	this.fDbModule.SessionSpeichern(this.programm.SessionListe[mEvent.previousIndex] as Session);
	// 	this.fDbModule.SessionSpeichern(this.programm.SessionListe[mEvent.currentIndex] as Session);		
	// }

    ngAfterViewInit() {
        this.ViewInitDone = true;        
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
