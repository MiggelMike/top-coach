import { ISession } from 'src/Business/Session/Session';
import { Uebung } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";
import { Satz, ISatz, SatzStatus } from "./../../../Business/Satz/Satz";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { floatMask, repMask } from './../../app.module';

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit {
    @Input() programm: ITrainingsProgramm = null;
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: ISatz;
    @Input() rowNum: number;
    @Input() satzTyp: string;
    public floatMask = floatMask;
    public repMask = repMask;    

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}
    
    ngOnInit() {
        this.satz.BodyWeight = this.sess.BodyWeight;
    }

    public DeleteSet() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete set #${this.rowNum + 1} ?`);
        mDialogData.OkFn = ():void => {
            const index: number = this.sessUebung.SatzListe.indexOf(this.satz as Satz);
            if (index !== -1) {
                this.sessUebung.SatzListe.splice(index, 1);
            }
        };   

        this.fDialogService.JaNein(mDialogData);
    }

    public get SatzFertig(): Boolean{
        return (this.satz.Status === SatzStatus.Fertig);
    }

    public set SatzFertig(value) {
        this.satz.Status = value ? SatzStatus.Fertig : SatzStatus.Wartet;
    } 

    public SetWeightVorgabe(aEvent: any) {
        this.satz.GewichtVorgabe = aEvent.target.value;
    }

    public SetWdhVorgabe(aEvent: any) {
        this.satz.WdhVonVorgabe = aEvent.target.value;
    }    

    public SetWeightAusgefuehrt(aEvent: any) {
        this.satz.GewichtAusgefuehrt = aEvent.target.value;
    }

    public SetWdhAusgefuehrt(aEvent: any) {
        this.satz.WdhAusgefuehrt = aEvent.target.value;
    }    

    public CopySet() {
        this.fGlobalService.SatzKopie = this.satz.Copy();
    }

    ngDoCheck() {
    }
}
