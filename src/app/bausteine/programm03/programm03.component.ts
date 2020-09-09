import { DialogeService } from './../../services/dialoge.service';
import { DialogData } from './../../dialoge/hinweis/hinweis.component';
import {
    Uebung_Sess,
    IUebung_Sess,
} from "./../../../Business/Uebung/Uebung_Sess";
import { ISatz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";
import { Component, OnInit, Input } from "@angular/core";
import { ISession } from "../../../Business/Session/Session";
import { GlobalService } from './../../services/global.service';

@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
})
export class Programm03Component implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satz: ISatz;

    @Input() session: ISession;

    ngOnInit() {}

    constructor(private fDialogService: DialogeService) {}

    public SetWeight(value: number, satz: ISatz) {
        satz.GewichtVorgabe = value;
    }

    public AddSet(aUebung_Sess: IUebung_Sess, aSatzTyp: string) {
        let mSatz: ISatz;
        if (aSatzTyp === "Training")
            mSatz = aUebung_Sess.NeuerSatz(
                SatzTyp.Training,
                LiftTyp.Custom,
                0,
                0,
                false
            );
        aUebung_Sess.SatzListe.push(mSatz);
        return mSatz;
    }

    public PasteSet(aUebung_Sess: IUebung_Sess) {
        alert("PasteSet");
    }
    
    public CopySet(aUebung_Sess: IUebung_Sess, aSatzTyp: string) {
        alert("CopySet");
    }    

    public DeleteExercise(aUebung_Sess: IUebung_Sess) {
        alert("DeleteExercise");
    }  
    
    public CopyExcercise(aUebung_Sess: IUebung_Sess) {
        alert("CopyExcercise");
    }  

    public DeleteSet(aSatz: ISatz, aUebung_Sess: IUebung_Sess) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Delete set?");
        mDialogData.OkFn = () => {
            const index: number = aUebung_Sess.SatzListe.indexOf(aSatz);
            if (index !== -1) {
                aUebung_Sess.SatzListe.splice(index, 1);
            }
        };

        this.fDialogService.JaNein(mDialogData);
    }
}
