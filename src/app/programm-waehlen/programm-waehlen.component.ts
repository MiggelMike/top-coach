import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import {CdkDragDrop } from '@angular/cdk/drag-drop';
import { IProgramModul, ProgramModulTyp } from '../app.module';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit, IProgramModul {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    ViewInitDone: boolean = false;
    get ProgrammListe(): Array<ITrainingsProgramm> {
        return DexieSvcService.StandardProgramme;
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
