import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Observable } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';

import { ProgrammWaehlenService } from '../services/programm-waehlen.service';
import { TrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { DBModule } from './../../modules/db/db.module';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(
        private ProgWahlSvc: ProgrammWaehlenService,
        private fDbModule: DBModule
    ) {
        this.ProgrammListeObserver = this.ProgWahlSvc.LadeTrainingsProgramme();
    }

    ngOnInit() {
        this.fDbModule.LadeProgramme();
        this.ProgrammListe = this.fDbModule.Programme;
    }

    public LadeTrainingsProgramme(): Array<ITrainingsProgramm> {
        this.ProgrammListeObserver.subscribe(
            (programme: Array<TrainingsProgramm>) => {
                this.ProgrammListe = programme;
            }
        );
        return this.ProgrammListe;
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return this.ProgrammListe.length > 0;
    }
}
