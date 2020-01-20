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

    constructor() { }

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
        return mResult;
    }

}
