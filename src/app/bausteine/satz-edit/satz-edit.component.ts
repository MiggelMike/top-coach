import { Progress } from './../../../Business/Progress/Progress';
import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { PlateCalcSvcService, PlateCalcOverlayConfig } from './../../services/plate-calc-svc.service';
import { ISession } from 'src/Business/Session/Session';
import { Uebung } from './../../../Business/Uebung/Uebung';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";
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
    @Input() sess: ISession;
    @Input() sessUebung: Uebung;
    @Input() satz: ISatz;
    @Input() rowNum: number;
    @Input() satzTyp: string;
    public floatMask = floatMask;
    public repMask = repMask;
    public plateCalcComponent: PlateCalcComponent;
    private plateCalcOverlayConfig: PlateCalcOverlayConfig;
    private StoppUhrOverlayConfig: StoppUhrOverlayConfig;
    public StoppuhrComponent: StoppuhrComponent;
    private Progress: Progress;

    constructor(
        private fDialogService: DialogeService,
        private fStoppUhrService: StoppuhrSvcService,
        private fGlobalService: GlobalService,
        private fPlateCalcSvcService: PlateCalcSvcService,
        private fDbModule: DexieSvcService

    ) {
        this.fDbModule.LadeProgress(
            (mProgressListe: Array<Progress>) => {
                this.Progress = mProgressListe.find((p) => p.ID === this.sessUebung.FkProgress);
                // if (this.Progress)
                //    this.Progress.
            }
        )
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

    public DeleteSet() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete set #${this.rowNum + 1} ?`);
        mDialogData.OkFn = ():void => {
            const index: number = this.sessUebung.SatzListe.indexOf(this.satz as Satz);
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

    public SetWeightVorgabe(aEvent: any) {
        this.satz.GewichtVorgabe = aEvent.target.value;
    }

    public SetVonWdhVorgabe(aEvent: any) {
        this.satz.WdhVonVorgabe = aEvent.target.value;
        if (this.satz.WdhBisVorgabe < this.satz.WdhVonVorgabe)
            this.satz.WdhBisVorgabe = this.satz.WdhVonVorgabe;
    }
    
    public SetBisWdhVorgabe(aEvent: any) {
        this.satz.WdhBisVorgabe = aEvent.target.value;
        if (this.satz.WdhVonVorgabe > this.satz.WdhBisVorgabe)
            this.satz.WdhVonVorgabe = this.satz.WdhBisVorgabe;
    }
    
    onClickWdhBisVorgab(aEvent:any) {
        aEvent.target.Select();
    }

    public SetWeightAusgefuehrt(aEvent: any) {
        this.satz.GewichtAusgefuehrt = aEvent.target.value;
    }
    
    public CalcPlates($event) {
        if (this.plateCalcComponent) {
            // this.plateCalcComponent.Satz.GewichtAusgefuehrt = $event;
            this.plateCalcComponent.CalcPlates($event);
        }
       
    }

    public WeightAusgefuehrtClick(aEvent: any) {
        aEvent.stopPropagation();
        aEvent.target.select();

        this.plateCalcOverlayConfig =
            {
                satz: this.satz,
                uebung: this.sessUebung,
                left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
                top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
            } as PlateCalcOverlayConfig;
        
            
        this.plateCalcComponent = this.fPlateCalcSvcService.open(this.plateCalcOverlayConfig);
    }

    onClickSatzFertig(aSatz: ISatz, aChecked: boolean) {
        if(this.fStoppUhrService.StoppuhrComponent)
            this.fStoppUhrService.StoppuhrComponent.close();
        
        let mHeader: string = '';
        if (aChecked) {
            mHeader = '';
        }
    
        if (aChecked) {
            this.StoppUhrOverlayConfig =
                {
                    satz: this.satz,
                    uebung: this.sessUebung
                    // uebung: this.sessUebung,
                    // left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
                    // top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
                } as PlateCalcOverlayConfig;
    
        
            this.StoppuhrComponent = this.fStoppUhrService.open(this.StoppUhrOverlayConfig);
        }
    }    

    onClickWdhVonVorgabe(aEvent: any) {
        aEvent.target.Select();
    }    

    public SetWdhAusgefuehrt(aEvent: any) {
        this.satz.WdhAusgefuehrt = aEvent.target.value;
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
