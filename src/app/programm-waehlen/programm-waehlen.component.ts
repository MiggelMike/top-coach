import { DexieSvcService } from './../services/dexie-svc.service';
import { ITrainingsProgramm, ProgrammKategorie, ProgrammTyp } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
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
        this.ProgrammListeObserver.subscribe(
            () => (this.fDbModule.LadeProgramme(ProgrammKategorie.Vorlage,
                (mProgramm) => {
                    this.ProgrammListe = [];
                    if (mProgramm.ProgrammTyp === ProgrammTyp.Gzclp)
                        this.ProgrammListe.push(mProgramm);

                }))
            // () => {this.fDbModule.LadeProgramme(ProgrammKategorie.Vorlage,
            //     (mProgramme) => {
            //         // GZCLP ?
            //         if (this.fDbModule.FindVorlageProgramm(mProgramme, ProgrammTyp.Gzclp) === false)
            //             mProgramme.push(this.ErzeugeVorlageProgramm(ProgrammTyp.Gzclp) as TrainingsProgramm);
                    
            //         aLadeProgrammeFn(mProgramme);
            //     }
            // );
    
        );
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
