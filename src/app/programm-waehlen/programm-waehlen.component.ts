import { DexieSvcService } from './../services/dexie-svc.service';
import { ITrainingsProgramm  } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { DialogeService } from '../services/dialoge.service';


@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    public ProgrammListe: Array<ITrainingsProgramm> = [];

    constructor(
        public fDbModule: DexieSvcService,
		private fLoadingDialog: DialogeService

    ) {
        
        this.ProgrammListeObserver = of(this.ProgrammListe);
        this.LadeTrainingsProgramme();
    }

    ngOnInit() {
    }
    
    public LadeTrainingsProgramme(): void {
        
        //  this.fDbModule.LadeStandardProgramme()
        //             .then((aProgrammListe) => {
        //                 this.ProgrammListe = aProgrammListe;
        //             });
        
        this.ProgrammListeObserver.subscribe(
            () => {
                this.fDbModule.LadeStandardProgramme()
                    .then((aProgrammListe) => {
                        aProgrammListe.forEach((mProgram) => {
                            mProgram.SessionListe = [];
                        });
                        this.ProgrammListe = aProgrammListe;
                    });
                // const mDialogData = new DialogData();
                // mDialogData.ShowAbbruch = false;
                // mDialogData.ShowOk = false;
                // this.fLoadingDialog.Loading(mDialogData);
                // try {
                //     this.fDbModule.LadeStandardProgramme()
                //         .then((aProgrammListe) => {
                //             this.fLoadingDialog.fDialog.closeAll();
                //             this.ProgrammListe = aProgrammListe;
                //         });
                // }
                // catch {
                //     this.fLoadingDialog.fDialog.closeAll();
                // }
            });
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
