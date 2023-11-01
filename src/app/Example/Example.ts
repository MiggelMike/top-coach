import { Session } from './../../Business/Session/Session';
import { ITrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService, ProgrammParaDB, SatzParaDB, SessionParaDB, UebungParaDB } from '../services/dexie-svc.service';


export class Example {
    constructor(private fDbModul: DexieSvcService) {
        
    }

    public MakeExample(aProgrammName: string) {
        // const BisDatum: Date;
        const mProgrammPara: ProgrammParaDB = new ProgrammParaDB();
        mProgrammPara.SessionBeachten = true;
        mProgrammPara.SessionParaDB = new SessionParaDB();
        mProgrammPara.SessionParaDB.UebungenBeachten = true; 
        mProgrammPara.SessionParaDB.UebungParaDB = new UebungParaDB();
        mProgrammPara.SessionParaDB.UebungParaDB.SaetzeBeachten = true;
        mProgrammPara.SessionParaDB.UebungParaDB.SatzParaDB = new SatzParaDB();

        mProgrammPara.WhereClause = "Name";
        mProgrammPara.anyOf = () => {
            return aProgrammName as any;
        };

        // this.fDbModul.LadeProgrammeEx(mProgrammPara)
        //     .then((aProgrammListe: Array<ITrainingsProgramm>) => {
        //         const mMaxWochen: number = 8;
        //         let mHeute: Date = new Date(); 
                

        //         for (let mProgrammIndex = 0; mProgrammIndex < aProgrammListe.length; mProgrammIndex++) {
        //             const mProgramm: ITrainingsProgramm = aProgrammListe[mProgrammIndex];
        //             for (let mWoche = 0; mWoche < mMaxWochen; mWoche++) {
                    
        //             }//for
        //             break;
        //         }//for
        // }
    }
}