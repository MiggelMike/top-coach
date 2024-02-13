import { cWeightDigits, cMinDatum, AnyFn } from './../../services/dexie-svc.service';
import { NextProgress, Progress, ProgressPara, ProgressSet, ProgressTyp, VorgabeWeightLimit, WeightProgress } from './../../../Business/Progress/Progress';
import { onFormCloseFn,DexieSvcService } from 'src/app/services/dexie-svc.service';
import { PlateCalcSvcService, PlateCalcOverlayConfig, StoppUhrFn } from './../../services/plate-calc-svc.service';
import { ISession } from 'src/Business/Session/Session';
import { Uebung, SaetzeStatus } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm, TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ISatzTyp, Satz, SatzStatus, SatzTyp } from "./../../../Business/Satz/Satz";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { IProgramModul, ProgramModulTyp as ProgramModulTyp } from './../../app.module';
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
export class SatzEditComponent implements OnInit, ISatzTyp, ISessionStatus, IProgramModul  {
    @Input() programm: ITrainingsProgramm = null;
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: Satz;
    @Input() rowNum: number;
    @Input() SatzTyp:SatzTyp;
    @Input() DeletedSatzList: Array<Satz> = [];

    get programModulArt(): ProgramModulTyp {
        return DexieSvcService.ModulTyp;
    }
    public plateCalcComponent: PlateCalcComponent;
    private plateCalcOverlayConfig: PlateCalcOverlayConfig;
    //private StoppUhrOverlayConfig: StoppUhrOverlayConfig;
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
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
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
            const mStammUebung = DexieSvcService.StammUebungsListe.find((u) => u.ID === this.sessUebung.FkUebung);
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
        this.SetWeightAusgefuehrt($event); 
    }

    //getBodyWeight():string {
        //satz.getBodyWeightText('+ ')
    //}

    isVisible(): boolean{
        return DexieSvcService.ModulTyp !== ProgramModulTyp.SelectWorkoutEdit;
    }

    public MouseDown(aSatz: Satz, aEvent: any) {
        aEvent.stopPropagation();
        if (this.Disabled(aSatz))
            return;
        
        aEvent.target.select();
        this.DoPlateCalc(
            aSatz,
            this.sessUebung,
            this.sess,
            this.programm,
            this.fDbModule,
            (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
            (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
            this.fDialogService,
            this.AppData.GewichtsEinheitText,
            this.DoStoppUhr,
            this.fStoppUhrService,
            this.rowNum
        ); 
        
    }    
    
    DoPlateCalc(
        aSatz: Satz,
        aUebung: Uebung,
        aSess: ISession,
        aProgram: ITrainingsProgramm,
        aDbModul: DexieSvcService,
        aLeft: number,
        aTop: number,
        aDialogService: DialogeService,
        aGewichtEinheitsText: string,
        aStoppUhrFn: StoppUhrFn,
        aStoppUhrService: StoppuhrSvcService,
        aRowNumber: number,
        aSatzDone?: boolean,
        aFormCloseFn?: onFormCloseFn): void
    {
        this.interval = setInterval(() => {
            clearInterval(this.interval);
            this.plateCalcOverlayConfig = {
				satz: aSatz,
                uebung: aUebung,
                sess: aSess,
				left: aLeft,
				top: aTop,
                onFormCloseFn: aFormCloseFn,
                satzDone: aSatzDone,
                programm: aProgram,
                dbModul: aDbModul,
                dialogService: aDialogService,
                gewichtEinheitsText: aGewichtEinheitsText,
                stoppUhrFn: aStoppUhrFn,
                stoppUhrService: aStoppUhrService,
                rowNumber: aRowNumber
			} as PlateCalcOverlayConfig;
        
            
            this.plateCalcComponent = this.fPlateCalcSvcService.open(this.plateCalcOverlayConfig);
    
        }, this.cDelayMilliSeconds);
        
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
        if (DexieSvcService.ModulTyp === ProgramModulTyp.History || DexieSvcService.ModulTyp === ProgramModulTyp.HistoryView)
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

        if ((mChecked === true) && (aSatz.AMRAP === true)) {
            this.DoPlateCalc(
                aSatz,
                this.sessUebung,
                this.sess,
                this.programm,
                this.fDbModule,
                (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
                (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
                this.fDialogService,
                this.AppData.GewichtsEinheitText,
                this.DoStoppUhr,
                this.fStoppUhrService,
                this.rowNum,
                mChecked,
                this.DoClickSatzFertig
                
            );
        } else {
            const mClickSatzFertigPara: ClickSatzFertigPara = new ClickSatzFertigPara();
            mClickSatzFertigPara.fertig = mChecked;
            mClickSatzFertigPara.sess = this.sess;
            mClickSatzFertigPara.uebung = this.sessUebung;
            mClickSatzFertigPara.satz = aSatz;
            mClickSatzFertigPara.programm = this.programm;
            mClickSatzFertigPara.dbModul = this.fDbModule;
            mClickSatzFertigPara.dialogService = this.fDialogService;
            mClickSatzFertigPara.gewichtEinheitsText = this.AppData.GewichtsEinheitText;
            mClickSatzFertigPara.stoppUhrFn = this.DoStoppUhr;
            mClickSatzFertigPara.stoppUhrService = this.fStoppUhrService;
            mClickSatzFertigPara.rowNumber = this.rowNum;
            this.DoClickSatzFertig(mClickSatzFertigPara);
        }
        
    }
    
    DoClickSatzFertig(aClickSatzFertigPara: ClickSatzFertigPara){
        const mProgressPara: ProgressPara = new ProgressPara();
        mProgressPara.AusgangsSatz = aClickSatzFertigPara.satz;
        mProgressPara.AusgangsSession = aClickSatzFertigPara.sess;
        mProgressPara.AusgangsUebung = aClickSatzFertigPara.uebung;
        mProgressPara.AusgangsUebung.FailDatum = cMinDatum;
        mProgressPara.AusgangsUebung.WeightInitDate = cMinDatum;
        //        this.sessUebung.WeightInitDate = Uebung.StaticArbeitsSaetzeStatus(this.sessUebung) === SaetzeStatus.AlleFertig ? new Date : cMinDatum;
        mProgressPara.Programm = aClickSatzFertigPara.programm;
        mProgressPara.DbModule = aClickSatzFertigPara.dbModul;
        mProgressPara.SatzDone = aClickSatzFertigPara.fertig;
        mProgressPara.ProgressHasChanged = false;
        mProgressPara.ProgressListe = DexieSvcService.ProgressListe;
        // Routine zum Starten der Stoppuhr.
        mProgressPara.NextProgressFn = (aNextProgress: NextProgress) => {
            let mStopUhrUebung: Uebung = aClickSatzFertigPara.uebung;
            let mSatz: Satz = aClickSatzFertigPara.satz;
            let mFirstWaitingSet: Satz = aClickSatzFertigPara.satz as Satz;
            let mNextSetIndex: number = mSatz.SatzListIndex + 1;

            // Letzte Übung in Session und letzter Satz der Übung?
            if ((aClickSatzFertigPara.sess.isLetzteUebungInSession(aClickSatzFertigPara.uebung) === true) && (aClickSatzFertigPara.uebung.isLetzterSatzInUebung(aClickSatzFertigPara.satz  as Satz) === true)) {
                // Letzte Übung 
                // Letzter Satz
                // Keine Stoppuhr öffnen
                return;
            }
            // Nicht die letzte Übung in Session, aber letzter Satz der Übung?
            if ((aClickSatzFertigPara.sess.isLetzteUebungInSession(aClickSatzFertigPara.uebung) === false) && (aClickSatzFertigPara.uebung.isLetzterSatzInUebung(aClickSatzFertigPara.satz as Satz) === true)) {
                // Nächste Übung der Session suchen.
                mStopUhrUebung = aClickSatzFertigPara.sess.UebungsListe[aClickSatzFertigPara.uebung.ListenIndex + 1];
            }

            mFirstWaitingSet = mStopUhrUebung.getFindUndDoneSetAfter(aClickSatzFertigPara.satz as Satz);
            // Progress gefunden?
            if ((aNextProgress) && (mFirstWaitingSet === undefined))
                mStopUhrUebung = aNextProgress.Uebung;
                
            if (mFirstWaitingSet === undefined)
                mFirstWaitingSet = mStopUhrUebung.getFirstWaitingWorkSet();

            if (mFirstWaitingSet !== undefined) {
                if (mSatz !== mFirstWaitingSet)
                    mNextSetIndex = mFirstWaitingSet.SatzListIndex;
                mSatz = mFirstWaitingSet;

                aClickSatzFertigPara.stoppUhrFn(
                    mStopUhrUebung,
                    aClickSatzFertigPara.satz,
                    aClickSatzFertigPara.rowNumber,
                    aClickSatzFertigPara.sess,
                    aClickSatzFertigPara.stoppUhrService,
                    Number(mSatz.GewichtAusgefuehrt),
                    aClickSatzFertigPara.uebung.NaechsteUebungPause,
                    aClickSatzFertigPara.uebung.AufwaermArbeitsSatzPause, 
                    `"${mStopUhrUebung.Name}" - set #${(mNextSetIndex + 1).toString()} - weight: ${(mSatz.GewichtVorgabeStr)}`
                );
            }
        }
        
        const mDialogData: DialogData = new DialogData();
        Progress.StaticDoProgress(mProgressPara).then((aProgressPara: ProgressPara) => {
            try {
                aProgressPara.UserInfo = [];
                aClickSatzFertigPara.uebung.WeightInitDate = cMinDatum;
                aClickSatzFertigPara.uebung.WeightInitDate = new Date();

                if (aProgressPara.Wp === WeightProgress.Same)
                    aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                        
                if (
                    (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                    && (aClickSatzFertigPara.satz.SatzListIndex === 0)
                    && (aProgressPara.Wp === WeightProgress.Increase)
                ) {
                    mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung, cWeightDigits)} ${aClickSatzFertigPara.gewichtEinheitsText} for the next sets`);
                    mDialogData.textZeilen.push(`of this exercise of the current workout`);
                    mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                    aClickSatzFertigPara.uebung.WeightInitDate = new Date();
                    aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                }
                else if (
                    (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                    && (aClickSatzFertigPara.satz.SatzListIndex === 0)
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
                    mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - mSubWeight, cWeightDigits)} ${aClickSatzFertigPara.gewichtEinheitsText} for the next sets`);
                    mDialogData.textZeilen.push(`of this exercise of the current workout`);
                    mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                    aClickSatzFertigPara.uebung.WeightInitDate = new Date();
                    aClickSatzFertigPara.uebung.FailDatum = new Date();
                    aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                }
                else {
                    if (Uebung.StaticArbeitsSaetzeStatus(aClickSatzFertigPara.uebung) === SaetzeStatus.AlleFertig) {
                        if (aProgressPara.Progress.ProgressSet === ProgressSet.First
                            && aClickSatzFertigPara.uebung.SatzWDH(0) >= aClickSatzFertigPara.uebung.SatzBisVorgabeWDH(0)
                            || aProgressPara.Wp === WeightProgress.Increase
                        ) {
                            aClickSatzFertigPara.uebung.WeightInitDate = new Date();
                            mDialogData.textZeilen.push(`Well done!`);
                            if (aProgressPara.Progress.ProgressSet === ProgressSet.First) {
                                mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${this.AppData.GewichtsEinheitText} next time.`);
                                aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                            }
                            else {
                                mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung, cWeightDigits)} ${ aClickSatzFertigPara.gewichtEinheitsText} next time.`);
                                aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                            }
                        }
                        else if (
                            (aProgressPara.Wp === WeightProgress.Decrease || aProgressPara.Wp === WeightProgress.DecreaseNextTime)
                            && Uebung.StaticArbeitsSaetzeStatus(aClickSatzFertigPara.uebung) === SaetzeStatus.AlleFertig)
                        {
                            aClickSatzFertigPara.uebung.WeightInitDate = new Date();
                            aClickSatzFertigPara.uebung.FailDatum = new Date();
                            mDialogData.textZeilen.push(`You failed!`);
                            mDialogData.textZeilen.push(`Lift ${AppData.StaticRoundTo(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung, cWeightDigits)} ${aClickSatzFertigPara.gewichtEinheitsText} next time.`);
                            aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung);
                        } else if (aProgressPara.Wp === WeightProgress.Same) {
                            aClickSatzFertigPara.uebung.WeightInitDate = new Date();
                            mDialogData.textZeilen.push(`Lift same weight next time.`);
                            mDialogData.textZeilen.push(`${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${aClickSatzFertigPara.gewichtEinheitsText}`);
                            aClickSatzFertigPara.uebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                        }
                    }//if
                }

                if (aClickSatzFertigPara.satz.Status === SatzStatus.Fertig && this.sess.isLetzteUebungInSession(aClickSatzFertigPara.uebung) && this.sessUebung.isLetzterSatzInUebung(aClickSatzFertigPara.satz as Satz))
                    mDialogData.textZeilen.push('This was the last set!');

                if (mDialogData.textZeilen.length > 0)
                    aClickSatzFertigPara.dialogService.Hinweis(mDialogData);
            } catch (error) {
                console.log(error);
            }
        });
            
    }


    private DoStoppUhr(aUebung: Uebung, aSatz: Satz, aRowNumber: number, aSession: ISession, aStoppUhrService: StoppuhrSvcService, aNextTimeWeight: number, aNaechsteUebungPauseSec: number, aAufwaermArbeitsSatzPauseSec: number, aHeaderText: string): void {
        const mStoppUhrOverlayConfig: StoppUhrOverlayConfig = 
            {
                panelClass: 'cc-overlay',
                satz: aSatz,
                uebung: aUebung,
                session: aSession,
                satznr: aRowNumber + 1,
                nextTimeWeight: Number(aNextTimeWeight),
                NaechsteUebungPauseSec: aNaechsteUebungPauseSec,
                AufwaermArbeitsSatzPauseSec: aAufwaermArbeitsSatzPauseSec,
                headerText: aHeaderText,
            } as StoppUhrOverlayConfig;
    
    
        this.StoppuhrComponent = aStoppUhrService.open(mStoppUhrOverlayConfig);
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

class ClickSatzFertigPara {
    satz: Satz;
    fertig: boolean;
    sess: ISession;
    programm: ITrainingsProgramm;
    dbModul: DexieSvcService;
    uebung: Uebung;
    dialogService: DialogeService;
    gewichtEinheitsText: string;
    stoppUhrFn: StoppUhrFn;
    stoppUhrService: StoppuhrSvcService;
    rowNumber: number;
}