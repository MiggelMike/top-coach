import { Injectable } from '@angular/core';
import { Session, SessionKategorie, ProgrammTyp } from '../../Business/Session/Session';
import { Observable, of, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// export class SensorikService {
//     // private sensorikURL = AppConfig.apiEndpoint + 'Sensorik/Hefegehalt';
//     private sensorikURL = AppConfig.apiEndpoint;
//     private stammDatenURL = 'Sensorik/Stammdaten/';
//     constructor(private http: HttpClient ) { }

//     getAttribute(): Observable<SensorikAttribut[]> {

@Injectable({
    providedIn: 'root'
})
export class TrainingsProgrammSvcService {

    AnstehendeSessionObserver;

    SessionListe: Array<Session> = [
        {
            ID: 1,
            Name: 'aPara.Name',
            Saetze: [],
            Datum: new Date(),
            DauerInSek: 1,
            Typ: SessionKategorie.Konkret,
            ProgrammTyp: ProgrammTyp.Custom
        },
        {
            ID: 2,
            Name: 'aPara.Name',
            Saetze: [],
            Datum: new Date(),
            DauerInSek: 2,
            Typ: SessionKategorie.Konkret,
            ProgrammTyp: ProgrammTyp.Custom
        }
    ] ;

    constructor() { }

<<<<<<< HEAD
    public LadeAnstehendeSession(): Observable<Session[]> {
        const mResult = new Observable<Session[]>(
            observer => {
                this.AnstehendeSessionObserver = observer;
                observer.next(this.SessionListe);
            }
        );

=======
    public LadeAnstehendeSession(): Session[] {
        const mResult = new Array<Session>();
        let mSession = new Session();
        mSession.ID = 1;
        mSession.Name = 'aPara.Name';
        mSession.Saetze = [];
        mSession.Datum = new Date();
        mSession.DauerInSek = 1;
        mSession.Typ = SessionKategorie.Konkret;
        mSession.ProgrammTyp = ProgrammTyp.Custom;
        mResult.push(mSession);
        mSession = new Session();
        mSession.ID = 2;
        mSession.Name = 'aPara.Name2';
        mSession.Saetze = [];
        mSession.Datum = new Date();
        mSession.DauerInSek = 2;
        mSession.Typ = SessionKategorie.Konkret;
        mSession.ProgrammTyp = ProgrammTyp.Custom;
        mResult.push(mSession);
      //  const moResult = new Observable<Session[]>();
       // moResult.
>>>>>>> bc1472798a5c970d7724055ed52fe30b19a32247
        return mResult;
    }

}
