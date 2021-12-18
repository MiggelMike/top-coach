import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Hantel } from './../../../Business/Hantel/Hantel';
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

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService,
        private fPlateCalcSvcService: PlateCalcSvcService,
        private fDbModule: DexieSvcService

    ) {}
    
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

    public SetWeightAusgefuehrt(aEvent: any) {
        this.satz.GewichtAusgefuehrt = aEvent.target.value;
    }

    public WeightAusgefuehrtClick(aEvent: any) {
        aEvent.stopPropagation();

        this.plateCalcOverlayConfig =
            {
                satz: this.satz,
                left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
                top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
            } as PlateCalcOverlayConfig;
        
            
        this.plateCalcComponent = this.fPlateCalcSvcService.open(this.plateCalcOverlayConfig);
    }

    public SetWdhAusgefuehrt(aEvent: any) {
        this.satz.WdhAusgefuehrt = aEvent.target.value;
    }    

    public CopySet() {
        this.fGlobalService.SatzKopie = this.satz.Copy();
    }

    ngDoCheck() {
    }
}
