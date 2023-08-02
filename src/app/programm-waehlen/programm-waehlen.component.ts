import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { DialogeService } from '../services/dialoge.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit {
    [x: string]: any;
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(
        public fDbModule: DexieSvcService,
        private fLoadingDialog: DialogeService,
        private activatedRoute: ActivatedRoute
    ) {
        this.fDbModule.LadeStandardProgramme()
            .then((programme) => {
                this.ProgrammListe = programme;
            });
    }
        
        ngOnInit() {
        // this.activatedRoute.data.subscribe(
        //     (StandardProgramme: Array<ITrainingsProgramm>) => {
        //         this.ProgrammListe = StandardProgramme;
        //     });
    }
    
    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
