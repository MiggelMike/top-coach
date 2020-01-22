import { Injectable } from '@angular/core';
import { Session, SessionKategorie, ProgrammTyp } from '../../Business/Session/Session';
import { Observable, of, from } from 'rxjs';
import { ITrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { GlobalData } from '../../app/services/global.service';

@Injectable({
  providedIn: 'root'
})
export class ProgrammWaehlenService {

    public ProgrammWahlObserver;

    ProgrammListe: Array<ITrainingsProgramm> = [];



    private LadeProgramme(): void {
        this.ProgrammListe = GlobalData.StandardVorlagen;
    }

    public LadeTrainingsProgramme(): Observable<ITrainingsProgramm[]> {
        const mResult = new Observable<ITrainingsProgramm[]>(
            observer => {
                this.ProgrammWahlObserver = observer;
                this.LadeProgramme();
                observer.next(this.ProgrammListe);
            }
        );

        return mResult;
    }

  constructor() { }
}
