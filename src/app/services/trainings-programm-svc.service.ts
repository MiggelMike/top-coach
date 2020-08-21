import { UebungService } from './uebung.service';
import { GzclpProgramm } from './../../Business/TrainingsProgramm/Gzclp';
import { Injectable,  Optional, SkipSelf ,  ModuleWithProviders } from '@angular/core';
import { ISession } from '../../Business/Session/Session';
import { ITrainingsProgramm, SessionKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';


export interface ITrainingsProgrammSvc {
    LadeProgramme(): void;
}


@Injectable({
    providedIn: 'root'
})

export class TrainingsProgrammSvc implements ITrainingsProgrammSvc {

    constructor(private fUebungService: UebungService, @Optional() @SkipSelf() parentModule?: TrainingsProgrammSvc) {
        if (parentModule) {
            throw new Error(
              'TrainingsProgrammSvc is already loaded. Import it in the AppModule only');
          }

  
    }
    
    // static forRoot(config: TrainingsProgrammSvc): ModuleWithProviders {
    //     return {
    //       ngModule: TrainingsProgrammSvc,
    //       providers: [
    //         {provide: TrainingsProgrammSvc, useValue: config }
    //       ]
    //     };
    //   }

    public LadeProgramme() {

    }



    public ErzeugeKonkretesProgrammAusVorlage(aVorlageProgramm: ITrainingsProgramm): void {
        const m = aVorlageProgramm.ErstelleSessionsAusVorlage();
    }

    public ErzeugeStandardVorlagen(): Array<ITrainingsProgramm> {
        const mResult = new Array<ITrainingsProgramm>();
        const mGzclpProgramm = new GzclpProgramm(this.fUebungService, SessionKategorie.Vorlage);
        mGzclpProgramm.Name = 'GZCLP - Standard';
        const mSessions = new Array<ISession>();
        mGzclpProgramm.Init(mSessions);
        mResult.push(mGzclpProgramm);
        return mResult;
    }


    // static forRoot(config: TrainingsProgrammSvc): ModuleWithProviders {
    //     return {
    //         ngModule: GreetingModule,
    //         providers: [
    //             { provide: UserServiceConfig, useValue: config }
    //         ]
    //     };
    // }
}