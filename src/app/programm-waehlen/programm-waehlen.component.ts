import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { DialogeService } from '../services/dialoge.service';
import { ActivatedRoute } from '@angular/router';
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
        return this.fDbModule.StandardProgramme;
    };

    constructor(
        public fDbModule: DexieSvcService
    ) {
        DexieSvcService.StaticModulTyp = ProgramModulTyp.SelectWorkout;
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }
        
    ngOnInit() {
   
    }

    ngAfterViewInit() {
        this.ViewInitDone = true;        
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
