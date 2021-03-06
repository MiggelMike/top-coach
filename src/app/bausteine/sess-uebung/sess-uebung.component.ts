import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { Uebung, IUebung } from 'src/Business/Uebung/Uebung';
import { ISession, Session } from './../../../Business/Session/Session';
import { Component, OnInit, Input, ViewChildren, QueryList, ElementRef, ViewChild } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { ISatz, Satz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";
import { MatExpansionPanel } from '@angular/material/expansion';
import { SatzEditComponent } from '../satz-edit/satz-edit.component';

@Component({
    selector: "app-sess-uebung",
    templateUrl: "./sess-uebung.component.html",
    styleUrls: ["./sess-uebung.component.scss"],
})
export class SessUebungComponent implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satzTypText: string = "";
    @Input() programm: ITrainingsProgramm = null;
    @Input() programmTyp: string ='';
    @Input() session: ISession = null;
    @Input() sessUebung: Uebung;
    @Input() satzListe: Array<Satz>;
    @Input() rowNum: number = 0;
    @Input() panUebung1: MatExpansionPanel;
    @Input() bearbeitbar: Boolean;
    @Input() DeletedSatzList: Array<Satz> = [];
    @ViewChildren("AppSatzEdit") SatzEditList: QueryList<SatzEditComponent>;
    @ViewChild("ExpansionPanel") ExpansionPanel:MatExpansionPanel;
    

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {
    }

    ngOnInit(): void { }
    
    ngOnDestroy() {
        this.SatzEditList.forEach(
            (sz) => {
                if (   (sz.fStoppUhrService !== undefined)
                    && (sz.fStoppUhrService.StoppuhrComponent !== undefined)
                    && (sz.fStoppUhrService.close !== undefined)
                ) {
                    sz.fStoppUhrService.close();
                }
            });
    }

    public PasteSet(aEvent: Event) {
        if(this.ExpansionPanel.expanded === true)
            aEvent.stopPropagation();
        
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

    public AddSet(aEvent: Event) {
        if(this.ExpansionPanel.expanded === true)
            aEvent.stopPropagation();
        
        let mSatz: Satz;
        switch (this.satzTypText) {
            case "Warm up sets":
                mSatz = Satz.NeuerSatz(
                    SatzTyp.Aufwaermen,
                    LiftTyp.Custom,
                    0,
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
                    0,
                    this.session.ID,
                    this.sessUebung.ID,
                    false
                );
                break;
        } //switch
        
        this.sessUebung.SatzListe.push(mSatz);
        this.sessUebung.nummeriereSatzListe(this.sessUebung.SatzListe);
        return mSatz;
    }
}
