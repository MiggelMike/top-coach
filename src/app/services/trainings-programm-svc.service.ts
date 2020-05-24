import { UebungService } from './uebung.service';
import { GzclpProgramm } from './../../Business/TrainingsProgramm/Gzclp';
import { Injectable } from '@angular/core';
import { ISession } from '../../Business/Session/Session';
import { ITrainingsProgramm, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';


export interface ITrainingsProgrammSvc {
    LadeProgramme(): void;
}


@Injectable({
    providedIn: 'root'
})

export class TrainingsProgrammSvc implements ITrainingsProgrammSvc {

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
