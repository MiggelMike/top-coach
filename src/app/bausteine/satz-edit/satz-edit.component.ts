import { MinDatum } from './../../services/dexie-svc.service';
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
            if (aNextProgress !== undefined) {
                this.DoStoppUhr(Number(aNextProgress.Satz.GewichtAusgefuehrt),
                    `"${aNextProgress.Uebung.Name}" - set #${(aNextProgress.Satz.SatzListIndex + 1).toString()} - weight: ${(aNextProgress.Satz.GewichtVorgabeStr)}`
                );
            }
        }

        const mDialogData: DialogData = new DialogData();
        Progress.StaticDoProgress(mProgressPara).then( (aProgressPara: ProgressPara) => {
            aProgressPara.DbModule.LadeAppData()
                .then((aAppData) => {
                    try {
                        aProgressPara.UserInfo = [];
                        this.sessUebung.WeightInitDate = MinDatum;

                        if (
                            (aProgressPara.Progress.ProgressSet === ProgressSet.First)
                            && (aSatz.SatzListIndex === 0)
                            && (aProgressPara.Wp === WeightProgress.Increase)
                        ) {
                            mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung} ${aAppData.GewichtsEinheitText} for the next sets`);
                            mDialogData.textZeilen.push(`of this exercise of the current workout`);
                            mDialogData.textZeilen.push(`and also in upcoming workouts.`);
                            this.sessUebung.WeightInitDate = new Date();
                            this.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                        }
                        else {
                            if (this.sessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig) {
                                if (aProgressPara.Progress.ProgressSet === ProgressSet.First
                                    && this.sessUebung.SatzWDH(0) >= this.sessUebung.SatzBisVorgabeWDH(0)
                                    || aProgressPara.Wp === WeightProgress.Increase
                                ) {
                                    this.sessUebung.WeightInitDate = new Date();
                                    mDialogData.textZeilen.push(`Well done!`);
                                    if (aProgressPara.Progress.ProgressSet === ProgressSet.First) {
                                        mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${aAppData.GewichtsEinheitText} next time.`);
                                        this.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                                    }
                                    else {
                                        mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung} ${aAppData.GewichtsEinheitText} next time.`);
                                        this.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt + aProgressPara.AusgangsUebung.GewichtSteigerung);
                                    }
                                }
                                else if (
                                        (aProgressPara.Wp === WeightProgress.Decrease || aProgressPara.Wp === WeightProgress.DecreaseNextTime)
                                    &&  this.sessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig )
                                {
                                    this.sessUebung.WeightInitDate = new Date();
                                    mDialogData.textZeilen.push(`You failed!`);
                                    mDialogData.textZeilen.push(`Lift ${aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung} ${aAppData.GewichtsEinheitText} next time.`);
                                    this.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt - aProgressPara.AusgangsUebung.GewichtReduzierung);
                                } else if (aProgressPara.Wp === WeightProgress.Same) {
                                    mDialogData.textZeilen.push(`Lift same weight next time.`);
                                    mDialogData.textZeilen.push(`${aProgressPara.AusgangsSatz.GewichtAusgefuehrt} ${aAppData.GewichtsEinheitText}`);
                                    this.sessUebung.SetzeArbeitsSaetzeGewichtNaechsteSession(aProgressPara.AusgangsSatz.GewichtAusgefuehrt);
                                }
                            }//if
                        }
                    
                        if (mDialogData.textZeilen.length > 0)
                            this.fDialogService.Hinweis(mDialogData);
                    } catch (error) {
                        console.log(error);
                    }
                });
        });
    }
        
    
    private DoStoppUhr(aNextTimeWeight: number, aHeaderText: string):void {
        this.StoppUhrOverlayConfig = 
            {
                satz: this.satz as Satz,
                uebung: this.sessUebung,
                satznr: this.rowNum + 1,
                nextTimeWeight: Number(aNextTimeWeight),
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
