import { of } from 'rxjs';
import { IUebung_Sess } from './../../../Business/Uebung/Uebung_Sess';
import { ISession } from './../../../Business/Session/Session';
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { ISatz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
    selector: "app-sess-uebung",
    templateUrl: "./sess-uebung.component.html",
    styleUrls: ["./sess-uebung.component.scss"],
})
export class SessUebungComponent implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satzTypText: string = "";
    @Input() satz: ISatz = null;
    @Input() session: ISession = null;
    @Input() sessUebung: IUebung_Sess;
    @Input() satzListe: Array<ISatz>;
    @Input() rowNum: number = 0;
    @Input() panUebung1: MatExpansionPanel;

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

    ngOnInit(): void {
        const x = 0;
    }

    public PasteSet() {
        if (this.fGlobalService.SatzKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSatz: ISatz = this.fGlobalService.SatzKopie.Copy();
        mSatz.SessionID = this.sessUebung.Session.ID;
        mSatz.Uebung = this.sessUebung.Uebung;
        
        switch (this.satzTypText) {
            case "Warm Up":
                mSatz.SatzTyp = SatzTyp.Aufwaermen;
                break;

            case "Cool Down":
                mSatz.SatzTyp = SatzTyp.Abwaermen;  
                break;
            
            default:
                mSatz.SatzTyp = SatzTyp.Training;
                break;
        } //switch        
        this.sessUebung.SatzListe.push(mSatz);
    }

    public DeleteExercise() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete excercise #${this.rowNum + 1} "${this.sessUebung.Uebung.Name}" ?`);
        mDialogData.OkFn = () => {
            // Index der SessUeb in Liste suchen.
            const index: number = this.session.UebungsListe.indexOf(
                this.sessUebung
            );

            // SessUeb-Index gefunden?
            if (index !== -1) {
                // SessUeb-Index gefunden
                // SessUeb aus Liste entfernen.
                this.session.UebungsListe.splice(index, 1);
            }

            if (this.fGlobalService.Comp03PanelUebungObserver != null) {
                this.panUebung1.expanded = false;
                of(this.panUebung1).subscribe(
                    this.fGlobalService.Comp03PanelUebungObserver
                );
            }
        };   

        this.fDialogService.JaNein(mDialogData);
    }

    public CopyExcercise() {
        this.fGlobalService.SessUebungKopie = this.sessUebung.Copy();
    }

    public AddSet() {
        let mSatz: ISatz;
        switch (this.satzTypText) {
            case "Warm Up":
                mSatz = this.sessUebung.NeuerSatz(
                    SatzTyp.Aufwaermen,
                    LiftTyp.Custom,
                    0,
                    0,
                    false
                );
                break;

                case "Cool Down":
                    mSatz = this.sessUebung.NeuerSatz(
                        SatzTyp.Abwaermen,
                        LiftTyp.Custom,
                        0,
                        0,
                        false
                    );
                break;
            
            default:
                mSatz = this.sessUebung.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.Custom,
                    0,
                    0,
                    false
                );
                break;
        } //switch
        
        this.sessUebung.SatzListe.push(mSatz);
        return mSatz;
    }
}
