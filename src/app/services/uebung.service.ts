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
                public fDialog?: MatDialog) { }

    public EditUebung(aUebung: Uebung, aUebungsListe: Array<Uebung>) {
        const mUebungEditData: UebungEditData = new UebungEditData();
        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.restoreFocus = true;
        mDialogConfig.width = "450px";
        mDialogConfig.height = "auto";
        mDialogConfig.disableClose = false;
        mDialogConfig.autoFocus = true;
        mDialogConfig.hasBackdrop = true;
        mUebungEditData.fUebung = aUebung;
        mUebungEditData.fUebungListe = aUebungsListe;
        mDialogConfig.data = mUebungEditData;
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
        mDialogConfig.width = "400px";
        mDialogConfig.height = "600px";
        mDialogConfig.panelClass = 'cc-Dialog';
        mDialogConfig.disableClose = false;
        mDialogConfig.autoFocus = true;
        mDialogConfig.hasBackdrop = true;
        this.Uebungen = this.fDbModule.UebungListeSortedByName;
        this.Uebungen.forEach(
                    (mUebung) => {
                        // if (!mUebung.Selected)
                            mUebung.Selected = false;
                    }
                );
        mDialogConfig.data = mUebungWaehlenData;
        mUebungWaehlenData.fUebungsListe = this.Uebungen;
        mUebungWaehlenData.OkClickFn = aSelectFn;
        mUebungWaehlenData.fSession = aSession;
        mUebungWaehlenData.fMatDialog = this.fDialog!.open(UebungWaehlenComponent, mDialogConfig);        
    }
}
