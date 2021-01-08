import { Uebung } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";
import { Satz } from "./../../../Business/Satz/Satz";
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
    @Input() sessUebung: Uebung;
    @Input() satz: Satz;
    @Input() rowNum: number;
    @Input() satzTyp: string;
    public floatMask = floatMask;
    public repMask = repMask;    

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) { }
    
    ngOnInit() {}

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

    public SetWeight(value: number) {
        this.satz.GewichtVorgabe = value;
    }

    public SetWdhVorgabe(value: number) {
        this.satz.WdhVorgabe = value;
    }    

    public CopySet(aSatz : any) {
        this.fGlobalService.SatzKopie = this.satz.Copy();
    }
}
