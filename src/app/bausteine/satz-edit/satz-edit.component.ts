import { cWeightDigits, cMinDatum, UebungParaDB } from './../../services/dexie-svc.service';
import { NextProgress, Progress, ProgressPara, ProgressSet, ProgressTyp, VorgabeWeightLimit, WeightProgress } from './../../../Business/Progress/Progress';
import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { PlateCalcSvcService, PlateCalcOverlayConfig } from './../../services/plate-calc-svc.service';
import { ISession } from 'src/Business/Session/Session';
import { Uebung, SaetzeStatus } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ISatzTyp, Satz, SatzStatus, SatzTyp } from "./../../../Business/Satz/Satz";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { ProgramModulTyp as ProgramModulTyp, floatMask, repMask } from './../../app.module';
import { PlateCalcComponent } from 'src/app/plate-calc/plate-calc.component';
import { StoppuhrComponent } from 'src/app/stoppuhr/stoppuhr.component';
import { StoppUhrOverlayConfig, StoppuhrSvcService } from 'src/app/services/stoppuhr-svc.service';
import { AppData } from 'src/Business/Coach/Coach';
import { ISessionStatus, SessionStatus } from 'src/Business/SessionDB';

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit, ISatzTyp, ISessionStatus {
    @Input() programm: ITrainingsProgramm = null;
    @Input() programmModul: ProgramModulTyp;
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: Satz;
    @Input() rowNum: number;
    @Input() SatzTyp:SatzTyp;
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
    private AppData: AppData;

    constructor(
        private fDialogService: DialogeService,
        public fStoppUhrService: StoppuhrSvcService,
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
        this.fDbModule.LadeAppData()
            .then((mAppData) => {
                this.AppData = mAppData;
            });
    }
    get sessionStatus(): typeof SessionStatus {
        return SessionStatus;
    }
    
    get satzTyp(): typeof SatzTyp {
        return SatzTyp;
    }
    
    ngOnInit() {
		this.fDbModule.LadeSessionBodyweight(this.sess)
			.then((aBw) => {
                if (aBw !== undefined)
                    this.satz.BodyWeight = aBw.Weight;
                else
                this.satz.BodyWeight = 0;
			});
        
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

    public MouseDown(aSatz: Satz, aEvent: any) {
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

    public Disabled(aSatz:Satz): boolean{
        return aSatz.Status === SatzStatus.Fertig;
    }

    async onClickSatzFertig(aSatz: Satz, aEvent: any) {
        const mChecked = aEvent.checked;
        if (this.programmModul === ProgramModulTyp.History)
            return;

        if (this.fStoppUhrService.StoppuhrComponent) {
            this.fStoppUhrService.StoppuhrComponent.close();
            this.StoppuhrComponent = undefined;
        }
        
            
        let mHeader: string = '';
        if (mChecked) {
            mHeader = '';
        }

        aSatz.Datum = mChecked === true ? new Date() : undefined;
        const mProgressPara: ProgressPara = new ProgressPara();
        mProgressPara.AusgangsSatz = aSatz as Satz;
        mProgressPara.AusgangsSession = this.sess;
        mProgressPara.AusgangsUebung = this.sessUebung;
        mProgressPara.AusgangsUebung.FailDatum = cMinDatum;
        mProgressPara.AusgangsUebung.WeightInitDate = cMinDatum;
        //        this.sessUebung.WeightInitDate = Uebung.StaticArbeitsSaetzeStatus(this.sessUebung) === SaetzeStatus.AlleFertig ? new Date : cMinDatum;
        mProgressPara.Programm = this.programm;
        mProgressPara.DbModule = this.fDbModule;
        mProgressPara.SatzDone = mChecked;
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
            // Nicht die letzte Übung in Session, aber letzter Satz der Übung?
            if ((this.sess.isLetzteUebungInSession(this.sessUebung) === false) && (this.sessUebung.isLetzterSatzInUebung(aSatz as Satz) === true)) {
                // Nächste Übung der Session suchen.
                mStopUhrUebung = this.sess.UebungsListe[this.sessUebung.ListenIndex + 1];
            }

            mFirstWaitingSet = mStopUhrUebung.getFindUndDoneSetAfter(aSatz as Satz);
            // Progress gefunden?
            if ((aNextProgress) && (mFirstWaitingSet === undefined))
                mStopUhrUebung = aNextProgress.Uebung;
                
            if (mFirstWaitingSet === undefined)
                mFirstWaitingSet = mStopUhrUebung.getFirstWaitingWorkSet();

            if (mFirstWaitingSet !== undefined) {
                if (mSatz !== mFirstWaitingSet)
                    mNextSetIndex = mFirstWaitingSet.SatzListIndex;
                mSatz = mFirstWaitingSet;

                this.DoStoppUhr(
                    mStopUhrUebung,
                    Number(mSatz.GewichtAusgefuehrt),
                    this.sessUebung.NaechsteUebungPause,
                    this.sessUebung.AufwaermArbeitsSatzPause, 
                    `"${mStopUhrUebung.Name}" - set #${(mNextSetIndex + 1).toString()} - weight: ${(mSatz.GewichtVorgabeStr)}`
                );
            }
        }

        const mDialogData: DialogData = new DialogData();
        const that = this;
        Progress.StaticDoProgress(mProgressPara).then((aProgressPara: ProgressPara) => {
            try {
                aProgressPara.UserInfo = [];
                that.sessUebung.WeightInitDate = cMinDatum;
                that.sessUebung.WeightInitDate = new Date();

                if (aProgressPara.Wp === WeightProgress.Same)
                    that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                        
                if (
                    (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                    && (aSatz.SatzListIndex === 0)
                    && (aProgressPara.Wp === WeightProgress.Increase)
                ) {
                    mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung, cWeightDigits)} ${that.AppData.GewichtsEinheitText} for the next sets`);
                    mDialogData.textZeilen.push(`of this exercise of the current workout`);
                    mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                    that.sessUebung.WeightInitDate = new Date();
                    that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                }
                else if (
                    (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                    && (aSatz.SatzListIndex === 0)
                    && (aProgressPara.Wp === WeightProgress.Decrease)
                ) {
                    let mSubWeight = 0;
                    // Der Progressmodus ist "ProgressSet.First"
                    // Der Anwender hatte diesen Satz nicht mit der vollständigen Anzahl der Wiederholungen beendet.
                    // Er hatte den Haken "erledigt" gesetzt,
                    // Jetzt hat er diesen Haken wieder zurückgesetzt.
                    // Falls für die Übung mehr als ein Satz vorgesehen ist und er im zweiten Satz das Array "GewichtDiff" Einträge hat,
                    // wird aus diesem Ehreder Wert für das Gewicht geholt.
                    if ((aProgressPara.AusgangsUebung.SatzListe.length > 1) && (aProgressPara.AusgangsUebung.SatzListe[1].GewichtDiff.length > 0))
                        // Wert wird negiert
                        mSubWeight = -aProgressPara.AusgangsUebung.SatzListe[1].GewichtDiff[0].Gewicht;
                    // mSubWeight für die Meldung an den Anwender verwenden
                    mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - mSubWeight, cWeightDigits)} ${that.AppData.GewichtsEinheitText} for the next sets`);
                    mDialogData.textZeilen.push(`of this exercise of the current workout`);
                    mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                    that.sessUebung.WeightInitDate = new Date();
                    that.sessUebung.FailDatum = new Date();
                    that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                }
                else {
                    if (Uebung.StaticArbeitsSaetzeStatus(that.sessUebung) === SaetzeStatus.AlleFertig) {
                        if (aProgressPara.Progress.ProgressSet === ProgressSet.First
                            && that.sessUebung.SatzWDH(0) >= that.sessUebung.SatzBisVorgabeWDH(0)
                            || aProgressPara.Wp === WeightProgress.Increase
                        ) {
                            that.sessUebung.WeightInitDate = new Date();
                            mDialogData.textZeilen.push(`Well done!`);
                            if (aProgressPara.Progress.ProgressSet === ProgressSet.First) {
                                mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${this.AppData.GewichtsEinheitText} next time.`);
                                that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                            }
                            else {
                                mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung, cWeightDigits)} ${that.AppData.GewichtsEinheitText} next time.`);
                                that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                            }
                        }
                        else if (
                            (aProgressPara.Wp === WeightProgress.Decrease || aProgressPara.Wp === WeightProgress.DecreaseNextTime)
                            && Uebung.StaticArbeitsSaetzeStatus(that.sessUebung) === SaetzeStatus.AlleFertig) {
                            that.sessUebung.WeightInitDate = new Date();
                            that.sessUebung.FailDatum = new Date();
                            mDialogData.textZeilen.push(`You failed!`);
                            mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung, cWeightDigits)} ${that.AppData.GewichtsEinheitText} next time.`);
                            that.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung);
                        } else if (aProgressPara.Wp === WeightProgress.Same) {
                            that.sessUebung.WeightInitDate = new Date();
                            mDialogData.textZeilen.push(`Lift same weight next time.`);
                            mDialogData.textZeilen.push(`${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${that.AppData.GewichtsEinheitText}`);
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
    }
        
    
    private DoStoppUhr(aUebung: Uebung, aNextTimeWeight: number, aNaechsteUebungPauseSec: number, aAufwaermArbeitsSatzPauseSec: number, aHeaderText: string):void {
        this.StoppUhrOverlayConfig = 
            {
                satz: this.satz as Satz,
                uebung: aUebung,
                session: this.sess,
                satznr: this.rowNum + 1,
                nextTimeWeight: Number(aNextTimeWeight),
                NaechsteUebungPauseSec: aNaechsteUebungPauseSec,
                AufwaermArbeitsSatzPauseSec: aAufwaermArbeitsSatzPauseSec,
                headerText: aHeaderText,
            } as StoppUhrOverlayConfig;
    
    
        this.StoppuhrComponent = this.fStoppUhrService.open(this.StoppUhrOverlayConfig);
    }

    onClickWdhVonVorgabe(aEvent: any) {
        aEvent.target.Select();
    }    

    public SetWdhAusgefuehrt(aEvent: any) {
        aEvent.stopPropagation();
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
