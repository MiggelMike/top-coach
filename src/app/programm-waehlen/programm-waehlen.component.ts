import { DexieSvcService } from './../services/dexie-svc.service';
import { TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit {
    public ProgrammListeObserver: Observable<TrainingsProgramm[]>;
    public ProgrammListe: Array<TrainingsProgramm> = [];

    constructor(public fDbModule: DexieSvcService
    ) {}

    ngOnInit() {
        this.ProgrammListeObserver = of(this.ProgrammListe);
        this.LadeTrainingsProgramme();
    }

    public LadeTrainingsProgramme(): void {
        this.ProgrammListeObserver.subscribe(
            () => {
                this.fDbModule.LadeProgramme().then(
                    () => this.ProgrammListe = this.fDbModule.Programme
                );
            }
        );
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
