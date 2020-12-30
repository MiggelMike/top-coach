import { UebungWaehlenComponent } from './../uebung-waehlen/uebung-waehlen.component';
import { Injectable } from '@angular/core';
import { serialize, deserialize, JsonProperty, IJsonObject } from '@peerlancers/json-serialization';
import { UebungsName, UebungsTyp, Uebung } from './../../Business/Uebung/Uebung';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Injectable({
    providedIn: "root",
})
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
    private fDialogConfig: MatDialogConfig;

    constructor(
        private fDialog: MatDialog
    ) {
        this.fDialogConfig = new MatDialogConfig();
        this.fDialogConfig.width = "400px";
        this.fDialogConfig.height = "280px";
        this.fDialogConfig.disableClose = true;
        this.fDialogConfig.autoFocus = true;
        this.fDialogConfig.data = '';
        this.fDialogConfig.hasBackdrop = false;
    }

    public UebungWaehlen() {
        this.fDialog.open(UebungWaehlenComponent, this.fDialogConfig);
    }

    public Kopiere(aUebung: Uebung): Uebung {
        return Uebung.StaticNeueUebung(
            aUebung.Name,
            aUebung.Typ,
            aUebung.Kategorieen01
        );
    }

    public LadeLetzteID(): number {
        const s = localStorage.getItem(this.cLetzteUebungID);
        this.LetzteUebungID = s === null ? 0 : parseInt(s);
        return this.LetzteUebungID;
    }

    public SpeicherLetzteID() {
        localStorage.setItem(
            this.cLetzteUebungID,
            this.LetzteUebungID.toString()
        );
    }

    public SucheUebungPerName(aName: UebungsName): Uebung {
        const mUebung = this.Uebungen.find((u) => u.Name === aName);
        return mUebung === undefined ? null : mUebung;
    }

    public LadeStammUebungen(): Array<Uebung> {
        const s = localStorage.getItem(this.cStammUebungen);
        if (s === null) return null;
        const mObject = JSON.parse(s);
        let mResult = Object.values(mObject);
        return mResult as Array<Uebung>;
    }

    public SpeicherStammUebungen(): void {
        const s = serialize(this.Uebungen);
        localStorage.setItem(this.cStammUebungen, JSON.stringify(s));
    }

    public ErzeugeUebungStammdaten() {
        const mKategorieen01 = [];
        const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
        const mDummy = this.LadeStammUebungen();

        this.LadeLetzteID();
        try {
            if (mDummy !== null) this.Uebungen = mDummy;
            for (const mUeb in UebungsName) {
                if (mUeb) {
                    let mUebung = this.SucheUebungPerName(mUeb as UebungsName);
                    if (mUebung === null) {
                        mUebung = Uebung.StaticNeueUebung(
                            mUeb,
                            UebungsTyp.Kraft,
                            mKategorieen01.concat(mGzclpKategorieen01)
                        );
                        this.AddUebung(mUebung);
                    }
                }
            }
            this.SpeicherStammUebungen();
        } finally {
            this.SpeicherLetzteID();
        }
    }

    public AddUebung(aUebung: Uebung) {
        this.Uebungen.push(aUebung);
    }
}
