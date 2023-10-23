import { EditExerciseComponent } from "../edit-exercise/edit-exercise.component";
import { DexieSvcService } from './dexie-svc.service';
import { Session } from 'src/Business/Session/Session';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { UebungWaehlenComponent, UebungWaehlenData } from './../uebung-waehlen/uebung-waehlen.component';
import { Injectable } from '@angular/core';
import { JsonProperty } from '@peerlancers/json-serialization';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { EditExerciseComponent, UebungEditData } from '../edit-exercise/edit-exercise.component';
import { UebungEditData } from '../edit-exercise/edit-exercise.component';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';


@Injectable({
    providedIn: "root",
})
    
export class UebungService {
    public readonly cStammUebungen: string = "StammUebungen";
    public readonly cLetzteUebungID: string = "LetzteUebungID";
    @JsonProperty()
    public Uebungen: Array<Uebung> = [];
    @JsonProperty()
    public LetzteUebungID: number = 0;

    constructor(private fDbModule: DexieSvcService,
        private fsso: ScrollStrategyOptions,
                public fDialog?: MatDialog) { }

    public EditUebung(aUebung: Uebung, aUebungsListe: Array<Uebung>) {
        const mUebungEditData: UebungEditData = new UebungEditData();

        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.restoreFocus = true;
        mDialogConfig.width = "75%";
        mDialogConfig.height = "85%";
        mDialogConfig.disableClose = false;
        mDialogConfig.autoFocus = true;

        mDialogConfig.data = mUebungEditData;
        mDialogConfig.hasBackdrop = false;

        mUebungEditData.fUebung = aUebung;
        mUebungEditData.fUebungListe = aUebungsListe;
        mUebungEditData.fMatDialog = this.fDialog!.open(EditExerciseComponent, mDialogConfig);
        
        (mUebungEditData.fMatDialog.componentInstance as EditExerciseComponent).UebungEditData = mUebungEditData;
        (mUebungEditData.fMatDialog.componentInstance as EditExerciseComponent).fDialog = mUebungEditData.fMatDialog;
        (mUebungEditData.fMatDialog.componentInstance as EditExerciseComponent).Uebung = mUebungEditData.fUebung;
        (mUebungEditData.fMatDialog.componentInstance as EditExerciseComponent).CmpUebung = mUebungEditData.fUebung.Copy();
    }


    public UebungWaehlen(aSession: Session, aSelectFn: any) {
        const mUebungWaehlenData: UebungWaehlenData = new UebungWaehlenData();

        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.restoreFocus = true;
        mDialogConfig.width = "75%";
        mDialogConfig.height = "85%";
        mDialogConfig.disableClose = false;
        mDialogConfig.autoFocus = true;
        mDialogConfig.scrollStrategy = this.fsso.noop();

        this.fDbModule.LadeStammUebungen().then(
            (aUebungen: Array<Uebung>) => {
                aUebungen.forEach(
                    (mUebung) => {
                        if (!mUebung.Selected)
                            mUebung.Selected = false;
                    }
                );

                this.Uebungen = aUebungen;
                mDialogConfig.data = mUebungWaehlenData;
                mDialogConfig.hasBackdrop = false;
                mUebungWaehlenData.fUebungsListe = aUebungen;
                mUebungWaehlenData.OkClickFn = aSelectFn;
                mUebungWaehlenData.fSession = aSession;
                // mUebungWaehlenData.fMatDialog = this.fDialog;
        
                mUebungWaehlenData.fMatDialog = this.fDialog!.open(UebungWaehlenComponent, mDialogConfig);
        
            }
        )
        

    }

    public AddUebung(aUebung: Uebung) {
        this.Uebungen.push(aUebung);
    }
}
