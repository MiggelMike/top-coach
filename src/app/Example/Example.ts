import { ITrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { ProgrammParaDB } from '../services/dexie-svc.service';
import { LadeAktuellesProgramm } from './../app-routing.module';
import { DexieSvcService } from 'src/app/services/dexie-svc.service';
export class Example {
    constructor(private fDbModul: DexieSvcService) {
        
    }

    public MakeExample() {
        // const BisDatum: Date;
        const mProgrammPara: ProgrammParaDB = new ProgrammParaDB();
        // this.fDbModul.LadeProgrammeEx(mProgrammPara)
        //     .then(() => 
        //     const mMaxWochen: number = 8;
        //     for (let mWoche = 0; mWoche < mMaxWochen; mWoche++) {
                
            
        //     }
        // }
    }
}