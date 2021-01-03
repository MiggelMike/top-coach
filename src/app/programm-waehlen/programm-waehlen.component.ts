import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Observable, of } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
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
        private fDbModule: DBModule
    ) {}

    ngOnInit() {
        this.ProgrammListeObserver = of(this.ProgrammListe);
        this.LadeTrainingsProgramme();
    }

    public LadeTrainingsProgramme(): void {
        this.ProgrammListeObserver.subscribe(
            () => {
                this.fDbModule.LadeProgramme().then(
                    () => {
                        this.ProgrammListe = this.fDbModule.Programme;
                    }
                )
            }
        );
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
