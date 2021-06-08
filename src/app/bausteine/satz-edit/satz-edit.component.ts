import { ISession } from 'src/Business/Session/Session';
import { Uebung } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";
import { Satz, SatzStatus } from "./../../../Business/Satz/Satz";
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
    @Input() programm: ITrainingsProgramm;
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: Satz;
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
            const index: number = this.sessUebung.SatzListe.indexOf(this.satz);
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

    public SetWeightVorgabe(value: number) {
        this.satz.GewichtVorgabe = value;
    }

    public SetWdhVorgabe(value: number) {
        this.satz.WdhVorgabe = value;
    }    

    public SetWeightAusgefuehrt(value: number) {
        this.satz.GewichtAusgefuehrt = value;
    }

    public SetWdhAusgefuehrt(value: number) {
        this.satz.WdhAusgefuehrt = value;
    }    

    public CopySet(aSatz : any) {
        this.fGlobalService.SatzKopie = this.satz.Copy();
    }

    ngDoCheck() {
    }
}
