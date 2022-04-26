import { DexieSvcService, ParaDB, ProgrammParaDB } from './../services/dexie-svc.service';
import { ITrainingsProgramm, ProgrammKategorie, ProgrammTyp, TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';


@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(public fDbModule: DexieSvcService
    ) {}

    ngOnInit() {
        this.ProgrammListeObserver = of(this.ProgrammListe);
        this.LadeTrainingsProgramme();
        //this.fDexieService.LadeVorlageProgramme();

    }

    public LadeTrainingsProgramme(): void {
        this.ProgrammListe = [];
       
        this.ProgrammListeObserver.subscribe(
            () => {
                this.fDbModule.LadeStandardProgramme()
                    .then((aProgrammListe) => this.ProgrammListe = aProgrammListe);
            }
        );
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
