import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
// import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { Observable } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';

import { ProgrammWaehlenService } from '../services/programm-waehlen.service';
import { TrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { GlobalService } from '../services/global.service';


@Component({
    selector: 'app-programm-waehlen',
    templateUrl: './programm-waehlen.component.html',
    styleUrls: ['./programm-waehlen.component.scss'],
})
    
    
export class ProgrammWaehlenComponent implements OnInit {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    public ProgrammListe: Array<TrainingsProgramm> = [];


    constructor(private ProgWahlSvc: ProgrammWaehlenService) {
        this.ProgrammListeObserver = this.ProgWahlSvc.LadeTrainingsProgramme();
    }

    ngOnInit() {
        this.ProgrammListeObserver = this.ProgWahlSvc.LadeTrainingsProgramme();
        this.LadeTrainingsProgramme();
    }

    public LadeTrainingsProgramme(): Array<TrainingsProgramm> {
        this.ProgrammListeObserver.subscribe((programme: Array<TrainingsProgramm>) =>    {
            this.ProgrammListe = programme;
        });
        return this.ProgrammListe;
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
