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
    public ProgrammListe: Array<ITrainingsProgramm> = [];
    // public ModulTyp: ProgramModulTyp = ProgramModulTyp.SelectWorkout;

    constructor(
        public fDbModule: DexieSvcService
    ) {
        this.ProgrammListe = this.fDbModule.StandardProgramme;
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }
        
    ngOnInit() {
   
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
