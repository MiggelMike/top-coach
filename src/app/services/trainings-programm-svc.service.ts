import { UebungService } from './uebung.service';
import { GzclpProgramm } from './../../Business/TrainingsProgramm/Gzclp';
import { Injectable } from '@angular/core';
import { ISession } from '../../Business/Session/Session';
import { Observable, of, from } from 'rxjs';
import { ITrainingsProgramm, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';



export interface ITrainingsProgrammSvc {
    LadeProgramme(): void;
}


@Injectable({
    providedIn: 'root'
})

export class TrainingsProgrammSvc implements ITrainingsProgrammSvc {

    // ListeAnstehenderSessions: Array<Session> = [];
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

    constructor(private fUebungService: UebungService) { }


    public LadeProgramme() {

    }



    public ErzeugeKonkretesProgrammAusVorlage( aVorlageProgramm: ITrainingsProgramm ): void {
        const m = aVorlageProgramm.ErstelleProgrammAusVorlage();
    }

    public ErzeugeStandardVorlagen(): Array<ITrainingsProgramm>{
        const mResult = new Array<ITrainingsProgramm>();
        const mGzclpProgramm = new GzclpProgramm(this.fUebungService, ProgrammKategorie.Vorlage);
        mGzclpProgramm.Name = 'GZCLP - Standard';
        const mSessions = new Array<ISession>();
        mGzclpProgramm.Init(mSessions);
        mResult.push(mGzclpProgramm);
        return mResult;
    }

}
