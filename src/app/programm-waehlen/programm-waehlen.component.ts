import { Component, OnInit } from '@angular/core';

import { ProgrammWaehlenService } from '../services/programm-waehlen.service';
import { TrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';

@Component({
    selector: 'app-programm-waehlen',
    templateUrl: './programm-waehlen.component.html',
    styleUrls: ['./programm-waehlen.component.scss']
})
export class ProgrammWaehlenComponent implements OnInit {

    public ProgrammListeObserver;
    public ProgrammListe: Array<TrainingsProgramm>;

    constructor(private ProgWahlSvc: ProgrammWaehlenService) { }

    ngOnInit() {
        this.ProgrammListeObserver = this.ProgWahlSvc.LadeTrainingsProgramme();
    }

    public LadeTrainingsProgramme(): Array<TrainingsProgramm> {
        this.ProgrammListeObserver.subscribe((programme: Array<TrainingsProgramm>) => {
            this.ProgrammListe = programme;
        });
        return this.ProgrammListe;
    }
}
