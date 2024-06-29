import { DexieSvcService } from './dexie-svc.service';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: "root",
})
export class ProgrammWaehlenService {
    public ProgrammWahlObserver;

    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(
        private fDbModule: DexieSvcService
    ) {
    }

    public LadeProgramm(aProgrammID: number): ITrainingsProgramm {
        for (let index = 0; index < this.ProgrammListe.length; index++) {
            if (this.ProgrammListe[index].id == aProgrammID)
                return this.ProgrammListe[index];
        }
        return null;
    }

    public LadeTrainingsProgramme(): Observable<ITrainingsProgramm[]> {
        const mResult = new Observable<ITrainingsProgramm[]>((observer) => {
            // this.fDbModule.LadeVerfuegbareProgramme();
            this.ProgrammWahlObserver = observer;
            this.ProgrammListe = DexieSvcService.VerfuegbareProgramme; //this.fDbModule.Programme;
            observer.next(this.ProgrammListe);
        });
        return mResult;
    }
}
