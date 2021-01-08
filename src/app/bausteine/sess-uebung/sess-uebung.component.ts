import { Uebung } from 'src/Business/Uebung/Uebung';
import { of } from 'rxjs';
import { ISession } from './../../../Business/Session/Session';
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { ISatz, Satz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
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
    @Input() sessUebung: Uebung;
    @Input() satzListe: Array<ISatz>;
    @Input() rowNum: number = 0;
    @Input() panUebung1: MatExpansionPanel;

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

    ngOnInit(): void {}

    public PasteSet() {
        if (this.fGlobalService.SatzKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSatz: Satz = this.fGlobalService.SatzKopie.Copy();
        mSatz.UebungID = this.sessUebung.ID;
        
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
        mDialogData.textZeilen.push(`Delete excercise #${this.rowNum + 1} "${this.sessUebung.Name}" ?`);
        mDialogData.OkFn = ():void => {
            // Index der SessUeb in Liste suchen.
            const index: number = this.session.UebungsListe.indexOf( this.sessUebung );

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
        let mSatz: Satz;
        switch (this.satzTypText) {
            case "Warm up sets":
                mSatz = Satz.NeuerSatz(
                    SatzTyp.Aufwaermen,
                    LiftTyp.Custom,
                    0,
                    0,
                    this.session.ID,
                    this.sessUebung.ID,
                    false
                );
                break;

                case "Cool down sets":
                    mSatz = Satz.NeuerSatz(
                        SatzTyp.Abwaermen,
                        LiftTyp.Custom,
                        0,
                        0,
                        this.session.ID,
                        this.sessUebung.ID,
                        false
                        );
                break;
            
            default:
                mSatz = Satz.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.Custom,
                    0,
                    0,
                    this.session.ID,
                    this.sessUebung.ID,
                    false
                );
                break;
        } //switch
        
        this.sessUebung.SatzListe.push(mSatz);
        return mSatz;
    }
}
