import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { IUebung_Sess } from "./../../../Business/Uebung/Uebung_Sess";
import { Component, OnInit, Input } from "@angular/core";
import { ISatz } from "./../../../Business/Satz/Satz";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() sessUebung: IUebung_Sess;
    @Input() satz: ISatz;
    @Input() rowNum: number;
    @Input() satzTyp: string;

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

    ngOnInit(): void {}

    public DeleteSet() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Delete set?");
        mDialogData.OkFn = () => {
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
