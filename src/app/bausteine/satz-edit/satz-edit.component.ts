import { Session } from './../../../Business/Session/Session';
import { MinDatum, UebungParaDB } from './../../services/dexie-svc.service';
import { NextProgress, Progress, ProgressPara, ProgressSet, ProgressTyp, VorgabeWeightLimit, WeightProgress } from './../../../Business/Progress/Progress';
import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { PlateCalcSvcService, PlateCalcOverlayConfig } from './../../services/plate-calc-svc.service';
import { ISession } from 'src/Business/Session/Session';
import { Uebung, ArbeitsSaetzeStatus } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Satz, ISatz, SatzStatus } from "./../../../Business/Satz/Satz";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { floatMask, repMask } from './../../app.module';
import { PlateCalcComponent } from 'src/app/plate-calc/plate-calc.component';
import { StoppuhrComponent } from 'src/app/stoppuhr/stoppuhr.component';
import { StoppUhrOverlayConfig, StoppuhrSvcService } from 'src/app/services/stoppuhr-svc.service';

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit {
    @Input() programm: ITrainingsProgramm = null;
    @Input() programmTyp: string = '';
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: ISatz;
    @Input() rowNum: number;
    @Input() satzTyp: string;
    @Input() DeletedSatzList: Array<Satz> = [];
    public floatMask = floatMask;
    public repMask = repMask;
    public plateCalcComponent: PlateCalcComponent;
    private plateCalcOverlayConfig: PlateCalcOverlayConfig;
    private StoppUhrOverlayConfig: StoppUhrOverlayConfig;
    public StoppuhrComponent: StoppuhrComponent;
    private Progress: Progress;
    private interval: any;
    private readonly cDelayMilliSeconds: number = 500;

    constructor(
        private fDialogService: DialogeService,
        public  fStoppUhrService: StoppuhrSvcService,
        private fGlobalService: GlobalService,
        private fPlateCalcSvcService: PlateCalcSvcService,
        private fDbModule: DexieSvcService

    ) {
        const mProgressPara: ProgressPara = new ProgressPara();
        mProgressPara.AfterLoadFn =
            (aProgressPara: ProgressPara) => {
                this.Progress = aProgressPara.ProgressListe.find((p) => p.ID === this.sessUebung.FkProgress);
            };

        this.fDbModule.LadeProgress(mProgressPara);
    }
    
    
    ngOnInit() {
        this.satz.BodyWeight = this.sess.BodyWeight;
        if (this.satz.FkHantel === undefined) {
            const mStammUebung = this.fDbModule.StammUebungsListe.find((u) => u.ID === this.sessUebung.FkUebung);
            if ((mStammUebung !== undefined) && (mStammUebung.FkHantel !== undefined)) {
                this.satz.FkHantel = mStammUebung.FkHantel;
            }
        }

        // this.programm.SessionListe.forEach((aSession) => {
        //     if ((aSession.UebungsListe === undefined) || (aSession.UebungsListe.length <= 0)) {
        //         const mUebungParaDB: UebungParaDB = new UebungParaDB();
        //         mUebungParaDB.SaetzeBeachten = true;
        //         this.fDbModule.LadeSessionUebungen(aSession.ID, mUebungParaDB)
        //             .then((aUebungen) => aSession.UebungsListe = aUebungen);
        //     }
        // });
    }

    ngOnDestroy() {
    }

    public DeleteSet() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete set #${this.rowNum + 1} ?`);
        mDialogData.OkFn = (): void => {
            const index: number = this.sessUebung.SatzListe.indexOf(this.satz as Satz);
            if (index !== -1) {
                if (this.satz.ID > 0)
                    this.DeletedSatzList.push(this.satz as Satz);
                this.sessUebung.SatzListe.splice(index, 1);
            }
        };

        this.fDialogService.JaNein(mDialogData);
    }

    public get SatzFertig(): Boolean {
        return (this.satz.Status === SatzStatus.Fertig);
    }

    public set SatzFertig(value) {
        this.satz.Status = value ? SatzStatus.Fertig : SatzStatus.Wartet;
    }

    public SetWeightVorgabe(aEvent: any) {
        this.satz.GewichtVorgabe = Number(aEvent.target.value);
    }

    public SetVonWdhVorgabe(aEvent: any) {
        this.satz.WdhVonVorgabe = Number(aEvent.target.value);
        if (this.satz.WdhBisVorgabe < this.satz.WdhVonVorgabe)
            this.satz.WdhBisVorgabe = this.satz.WdhVonVorgabe;
    }
    
    public SetBisWdhVorgabe(aEvent: any) {
        this.satz.WdhBisVorgabe = Number(aEvent.target.value);
        if (this.satz.WdhVonVorgabe > this.satz.WdhBisVorgabe)
            this.satz.WdhVonVorgabe = this.satz.WdhBisVorgabe;
    }
    
    onClickWdhBisVorgab(aEvent: any) {
        aEvent.target.select();
    }

    public SetWeightAusgefuehrt(aEvent: any) {
        this.satz.GewichtAusgefuehrt = Number(aEvent.target.value);
    }
    
    public CalcPlates($event) {
        if (this.plateCalcComponent) {
            // this.plateCalcComponent.Satz.GewichtAusgefuehrt = $event;
            this.plateCalcComponent.CalcPlates($event);
        }
       
    }

    public MouseDown(aSatz: ISatz, aEvent: any) {
        aEvent.stopPropagation();
        if (this.Disabled(aSatz))
            return;
        
        aEvent.target.select();
        
        this.interval = setInterval(() => {
            clearInterval(this.interval);
            this.plateCalcOverlayConfig =
                {
                    satz: this.satz,
                    uebung: this.sessUebung,
                    left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
                    top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
                } as PlateCalcOverlayConfig;
        
            
            this.plateCalcComponent = this.fPlateCalcSvcService.open(this.plateCalcOverlayConfig);

        }, this.cDelayMilliSeconds)
    }    

    public MouseUp(aEvent: any) {
        aEvent.stopPropagation();
        clearInterval(this.interval);
    }
  

    public WeightAusgefuehrtClick(aEvent: any) {
        aEvent.stopPropagation();
        aEvent.target.select();
    }

    public Disabled(aSatz:ISatz): boolean{
        return aSatz.Status === SatzStatus.Fertig;
    }

    async onClickSatzFertig(aSatz: ISatz, aChecked: boolean) {
        if (this.programmTyp === 'history')
            return;

        if (this.fStoppUhrService.StoppuhrComponent) {
            this.fStoppUhrService.StoppuhrComponent.close();
            this.StoppuhrComponent = undefined;
        }
        
            
        let mHeader: string = '';
        if (aChecked) {
            mHeader = '';
        }

        const mProgressPara: ProgressPara = new ProgressPara();
        mProgressPara.AusgangsSatz = aSatz as Satz;
        mProgressPara.AusgangsSession = this.sess;
        mProgressPara.AusgangsUebung = this.sessUebung;
        mProgressPara.Programm = this.programm;
        mProgressPara.DbModule = this.fDbModule;
        mProgressPara.SatzDone = aChecked;
        mProgressPara.ProgressHasChanged = false;
        mProgressPara.ProgressListe = this.fDbModule.ProgressListe;
        // Routine zum Starten der Stoppuhr.
        mProgressPara.NextProgressFn = (aNextProgress: NextProgress) => {
            let mStopUhrUebung: Uebung = this.sessUebung;
            let mSatz: Satz = aSatz as Satz;
            let mFirstWaitingSet: Satz = aSatz as Satz;
            let mNextSetIndex: number = mSatz.SatzListIndex + 1;

            // Letzte Übung in Session und letzter Satz der Übung?
            if ((this.sess.isLetzteUebungInSession(this.sessUebung) === true) && (this.sessUebung.isLetzterSatzInUebung(aSatz as Satz) === true)) {
                // Letzte Übung 
                // Letzter Satz
                // Keine Stoppuhr öffnen
                return;
            }
            // Nicht die letzte Übung in Session und letzter Satz der Übung?
            if ((this.sess.isLetzteUebungInSession(this.sessUebung) === false) && (this.sessUebung.isLetzterSatzInUebung(aSatz as Satz) === true)) {
                // Nächste Übung der Session suchen.
                mStopUhrUebung = this.sess.UebungsListe[this.sessUebung.ListenIndex + 1];
            }

            // Progress gefunden?
            if (aNextProgress) {
                if ((this.sess.isLetzteUebungInSession(this.sessUebung) === true) || (this.sessUebung.isLetzterSatzInUebung(aSatz as Satz) === true)) 
                    mStopUhrUebung = aNextProgress.Uebung;
            }
            
            mFirstWaitingSet = mStopUhrUebung.getFirstWaitingWorkSet();
            if (mFirstWaitingSet !== undefined) {
                if (mSatz !== mFirstWaitingSet)
                    mNextSetIndex = mFirstWaitingSet.SatzListIndex;
                mSatz = mFirstWaitingSet;

                this.DoStoppUhr(
                    mStopUhrUebung,
                    Number(mSatz.GewichtAusgefuehrt),
                    0, // NaechsteUebungPauseSec
                    `"${mStopUhrUebung.Name}" - set #${(mNextSetIndex + 1).toString()} - weight: ${(mSatz.GewichtVorgabeStr)}`
                );
            }
        }

        const mDialogData: DialogData = new DialogData();
        const that = this;
        Progress.StaticDoProgress(mProgressPara).then( (aProgressPara: ProgressPara) => {
            aProgressPara.DbModule.LadeAppData()
                .then((aAppData) => {
                    try {
                        aProgressPara.UserInfo = [];

                        that.sessUebung.WeightInitDate = MinDatum;

                        if (aProgressPara.Wp === WeightProgress.Same)
                            that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                        
                        if (
                            (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                            && (aSatz.SatzListIndex === 0)
                            && (aProgressPara.Wp === WeightProgress.Increase)
                        ) {
                            mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung} ${aAppData.GewichtsEinheitText} for the next sets`);
                            mDialogData.textZeilen.push(`of this exercise of the current workout`);
                            mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                            that.sessUebung.WeightInitDate = new Date();
                            that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                        }
                        else {
                            if (that.sessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig) {
                                if (aProgressPara.Progress.ProgressSet === ProgressSet.First
                                    && that.sessUebung.SatzWDH(0) >= that.sessUebung.SatzBisVorgabeWDH(0)
                                    || aProgressPara.Wp === WeightProgress.Increase
                                ) {
                                    that.sessUebung.WeightInitDate = new Date();
                                    mDialogData.textZeilen.push(`Well done!`);
                                    if (aProgressPara.Progress.ProgressSet === ProgressSet.First) {
                                        mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${aAppData.GewichtsEinheitText} next time.`);
                                        that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                                    }
                                    else {
                                        mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung} ${aAppData.GewichtsEinheitText} next time.`);
                                        that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                                    }
                                }
                                else if (
                                        (aProgressPara.Wp === WeightProgress.Decrease || aProgressPara.Wp === WeightProgress.DecreaseNextTime)
                                    &&  that.sessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig )
                                {
                                    that.sessUebung.WeightInitDate = new Date();
                                    mDialogData.textZeilen.push(`You failed!`);
                                    mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung} ${aAppData.GewichtsEinheitText} next time.`);
                                    that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung);
                                } else if (aProgressPara.Wp === WeightProgress.Same) {
                                    mDialogData.textZeilen.push(`Lift same weight next time.`);
                                    mDialogData.textZeilen.push(`${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${aAppData.GewichtsEinheitText}`);
                                    that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                                }
                            }//if
                        }

                        if (aSatz.Status === SatzStatus.Fertig && this.sess.isLetzteUebungInSession(this.sessUebung) && this.sessUebung.isLetzterSatzInUebung(aSatz as Satz))
                            mDialogData.textZeilen.push('This was the last set!');

                        if (mDialogData.textZeilen.length > 0)
                            that.fDialogService.Hinweis(mDialogData);
                    } catch (error) {
                        console.log(error);
                    }
                });
        });
    }
        
    
    private DoStoppUhr(aUebung: Uebung, aNextTimeWeight: number, aNaechsteUebungPauseSec: number, aHeaderText: string):void {
        this.StoppUhrOverlayConfig = 
            {
                satz: this.satz as Satz,
                uebung: aUebung,
                session: this.sess,
                satznr: this.rowNum + 1,
                nextTimeWeight: Number(aNextTimeWeight),
                NaechsteUebungPauseSec:aNaechsteUebungPauseSec,
                headerText: aHeaderText,
            } as StoppUhrOverlayConfig;
    
    
        this.StoppuhrComponent = this.fStoppUhrService.open(this.StoppUhrOverlayConfig);
    }

    onClickWdhVonVorgabe(aEvent: any) {
        aEvent.target.Select();
    }    

    public SetWdhAusgefuehrt(aEvent: any) {
        this.satz.WdhAusgefuehrt = Number(aEvent.target.value);
    }
    
    onClickWdhAusgefuehrt(aEvent: any) {
        aEvent.target.select();
    }

    public CopySet() {
        this.fGlobalService.SatzKopie = this.satz.Copy();
        this.fGlobalService.SatzKopie.ID = undefined;
    }

    ngDoCheck() {
    }
}
