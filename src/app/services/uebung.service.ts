import { Session } from 'src/Business/Session/Session';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { UebungWaehlenComponent, UebungWaehlenData } from './../uebung-waehlen/uebung-waehlen.component';
import { Injectable } from '@angular/core';
import { JsonProperty } from '@peerlancers/json-serialization';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';


// @Injectable({
//     providedIn: "root",
// })
    
export class UebungService {
    public readonly cStammUebungen: string = "StammUebungen";
    public readonly cLetzteUebungID: string = "LetzteUebungID";
    @JsonProperty()
    public Uebungen: Array<Uebung> = [];
    @JsonProperty()
    public LetzteUebungID: number = 0;

    constructor(public fDialog?: MatDialog) {}

    public UebungWaehlen(aUebungsListe: Array<Uebung>, aSession: Session, aSelectFn: any) {
        const mUebungWaehlenData: UebungWaehlenData = new UebungWaehlenData();

        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.restoreFocus = true;
        mDialogConfig.width = "75%";
        mDialogConfig.height = "85%";
        mDialogConfig.disableClose = false;
        mDialogConfig.autoFocus = true;

        aUebungsListe.forEach(
            (mUebung) => {
                if (!mUebung.Selected)
                    mUebung.Selected = false;
            }
        );

        mDialogConfig.data = mUebungWaehlenData;
        mDialogConfig.hasBackdrop = true;

        mUebungWaehlenData.fUebungsListe = aUebungsListe;
        mUebungWaehlenData.OkClickFn = aSelectFn;
        mUebungWaehlenData.fSession = aSession;
        // mUebungWaehlenData.fMatDialog = this.fDialog;

        mUebungWaehlenData.fMatDialog = this.fDialog.open(UebungWaehlenComponent, mDialogConfig);
    }



    // public LadeLetzteID(): number {
    //     const s = localStorage.getItem(this.cLetzteUebungID);
    //     this.LetzteUebungID = s === null ? 0 : parseInt(s);
    //     return this.LetzteUebungID;
    // }

    // public SpeicherLetzteID() {
    //     localStorage.setItem(
    //         this.cLetzteUebungID,
    //         this.LetzteUebungID.toString()
    //     );
    // }

    // public LadeStammUebungen(): Array<Uebung> {
    //     const s = localStorage.getItem(this.cStammUebungen);
    //     if (s === null) return null;
    //     const mObject = JSON.parse(s);
    //     let mResult = Object.values(mObject);
    //     return mResult as Array<Uebung>;
    // }

    // public SpeicherStammUebungen(): void {
    //     const s = serialize(this.Uebungen);
    //     localStorage.setItem(this.cStammUebungen, JSON.stringify(s));
    // }

    // public ErzeugeUebungStammdaten() {
    //     const mKategorieen01 = [];
    //     const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
    //     const mDummy = this.LadeStammUebungen();

    //     this.LadeLetzteID();
    //     try {
    //         if (mDummy !== null) this.Uebungen = mDummy;
    //         for (const mUeb in UebungsName) {
    //             if (mUeb) {
    //                 let mUebung = UebungService.SucheUebungPerName(
    //                     mUeb as UebungsName
    //                 );
    //                 if (mUebung === null) {
    //                     mUebung = Uebung.StaticNeueUebung(
    //                         mUeb,
    //                         UebungsTyp.Kraft,
    //                         mKategorieen01.concat(mGzclpKategorieen01)
    //                     );
    //                     this.AddUebung(mUebung);
    //                 }
    //             }
    //         }
    //         this.SpeicherStammUebungen();
    //     } finally {
    //         this.SpeicherLetzteID();
    //     }
    // }

    public AddUebung(aUebung: Uebung) {
        this.Uebungen.push(aUebung);
    }
}
