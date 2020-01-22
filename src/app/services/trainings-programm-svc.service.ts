import { Injectable } from '@angular/core';
import { Session, SessionKategorie, ProgrammTyp } from '../../Business/Session/Session';
import { Observable, of, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TrainingsProgrammSvcService {

    public AnstehendeSessionObserver;

    ListeAnstehenderSessions: Array<Session> = [];
    //     {
    //         ID: 1,
    //         TagNr: 1,
    //         Name: 'aPara.Name',
    //         Saetze: [],
    //         Datum: new Date(),
    //         DauerInSek: 1,
    //         Typ: SessionKategorie.Konkret,
    //         ProgrammTyp: ProgrammTyp.Custom
    //     },
    //     {
    //         ID: 2,
    //         TagNr: 2,
    //         Name: 'aPara.Name',
    //         Saetze: [],
    //         Datum: new Date(),
    //         DauerInSek: 2,
    //         Typ: SessionKategorie.Konkret,
    //         ProgrammTyp: ProgrammTyp.Custom
    //     }
    // ] ;

    constructor() { }

    public LadeAnstehendeSession(): Observable<Session[]> {
        const mResult = new Observable<Session[]>(
            observer => {
                this.AnstehendeSessionObserver = observer;
                observer.next(this.ListeAnstehenderSessions);
            }
        );
        return mResult;
    }

}
