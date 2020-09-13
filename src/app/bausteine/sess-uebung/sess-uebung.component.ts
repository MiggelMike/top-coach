import { IUebung_Sess } from './../../../Business/Uebung/Uebung_Sess';
import { ISession } from './../../../Business/Session/Session';
import { Component, OnInit, Input } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { ISatz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";



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

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

    ngOnInit(): void {}

    public SetWeight(value: number, satz: ISatz) {
        satz.GewichtVorgabe = value;
    }

    public PasteSet(aUebung_Sess: IUebung_Sess) {
        if (this.fGlobalService.SatzKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSatz: ISatz = this.fGlobalService.SatzKopie;
        mSatz.SessionID = aUebung_Sess.Session.ID;
        mSatz.Uebung = aUebung_Sess.Uebung;
        aUebung_Sess.SatzListe.push(mSatz);
    }

    public DeleteExercise(aUebung_Sess: IUebung_Sess) {
        alert("DeleteExercise");
    }

    public CopyExcercise(aUebung_Sess: IUebung_Sess) {
        alert("CopyExcercise");
    }

    public AddSet(aUebung_Sess: IUebung_Sess, aSatzTyp: string) {
        let mSatz: ISatz;
        if (aSatzTyp === "Training")
            mSatz = this.sessUebung.NeuerSatz(
                SatzTyp.Training,
                LiftTyp.Custom,
                0,
                0,
                false
            );
        
            this.sessUebung.SatzListe.push(mSatz);
        return mSatz;
    }
}
