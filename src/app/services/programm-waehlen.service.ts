import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { ITrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';

@Injectable({
    providedIn: 'root'
})
export class ProgrammWaehlenService {

    public ProgrammWahlObserver;

    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(private aGlobalService: GlobalService) { }

    private LadeProgramme(): void {
        this.ProgrammListe = this.aGlobalService.StandardVorlagen;
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
