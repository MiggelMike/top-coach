import { UebungService } from './uebung.service';
import { GzclpProgramm } from './../../Business/TrainingsProgramm/Gzclp';
import { Injectable, NgModule, Pipe,  Optional, SkipSelf ,  ModuleWithProviders } from '@angular/core';
import { ISession } from '../../Business/Session/Session';
import { ITrainingsProgramm, SessionKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';

export interface ITrainingsProgrammSvc {
    LadeProgramme(): void;
}

@Injectable({
    providedIn: 'root'
})

@NgModule({})
export class TrainingsProgrammSvc implements ITrainingsProgrammSvc {
//export declare class TrainingsProgrammSvc {
    declarations: [ TrainingsProgrammSvc]
    exports: [ TrainingsProgrammSvc]
           
    
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
        const mResult: Array<ITrainingsProgramm> = new Array<ITrainingsProgramm>();
        const mGzclpProgramm: GzclpProgramm  = new GzclpProgramm(this.fUebungService, SessionKategorie.Vorlage);
        mGzclpProgramm.Name = 'GZCLP - Standard';
        const mSessions: Array<ISession> = new Array<ISession>();
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



