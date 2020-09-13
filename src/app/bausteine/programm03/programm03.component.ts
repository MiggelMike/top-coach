import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ISession } from './../../../Business/Session/Session';
import { GlobalService } from "src/app/services/global.service";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { IUebung_Sess } from "./../../../Business/Uebung/Uebung_Sess";
import { ISatz, SatzTyp, LiftTyp } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";
import { Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";

@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
})
export class Programm03Component implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satz: ISatz;
    @Input() programm: ITrainingsProgramm;
    @Input() session: ISession;
    @ViewChildren('accUebung') accUebung: QueryList<MatAccordion>;
    @ViewChildren('panUebung') panUebung: QueryList<MatExpansionPanel>;

    private isExpanded: Boolean = true;
    public ToggleButtonText = 'Close all excercises';


    ngOnInit() {
    }

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

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
        if (this.fGlobalService.SatzCopy === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSatz: ISatz = this.fGlobalService.SatzCopy;
        mSatz.SessionID = aUebung_Sess.Session.ID;
        mSatz.Uebung = aUebung_Sess.Uebung;
        aUebung_Sess.SatzListe.push(mSatz);
    }

    public CopySet(aSatz: ISatz) {
        this.fGlobalService.SatzCopy = aSatz.Copy();
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

    toggleUebungen(): void {
        if (this.isExpanded) {
            this.accUebung.forEach( acc => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.accUebung.forEach( acc => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }

    accCheckUebungPanels() {
        let mAllClosed = true;

        const mPanUebungListe = this.panUebung.toArray();
        for (let index = 0; index < mPanUebungListe.length; index++) {
            if (mPanUebungListe[index].expanded) {
                mAllClosed = false;
                break;
            }
        }

        if (mAllClosed) {
            this.isExpanded = false;
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }
}
