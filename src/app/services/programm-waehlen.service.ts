import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { TrainingServiceModule } from '../../modules/training-service.module';

@Injectable({
    providedIn: 'root'
})
export class ProgrammWaehlenService {

    public ProgrammWahlObserver;

    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(private aGlobalService: GlobalService,  private aTrainingServiceModule: TrainingServiceModule) {
        console.log('>>> ProgrammWaehlenService x is ', aTrainingServiceModule.getX());
    
     }

    private LadeProgramme(): void {
        this.ProgrammListe = this.aGlobalService.StandardVorlagen;
    }

    public LadeProgramm(aProgrammID: number): ITrainingsProgramm {
        for (let index = 0; index < this.ProgrammListe.length; index++) {
            if (this.ProgrammListe[index].ID == aProgrammID)
                return this.ProgrammListe[index];
            
        }
        return null;
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

}
