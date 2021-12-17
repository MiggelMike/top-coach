import { Hantelscheibe } from './../../Business/Hantelscheibe/Hantelscheibe';
import { PlateCalcOverlayRef, cPlateCalcOverlayData } from './../services/plate-calc-svc.service';
import { Component, Inject, OnInit } from '@angular/core';
import { floatMask } from '../app.module';
import { PlateCalcOverlayConfig } from '../services/plate-calc-svc.service';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Satz } from 'src/Business/Satz/Satz';
import { Hantel } from 'src/Business/Hantel/Hantel';

@Component({
  selector: 'app-plate-calc',
  templateUrl: './plate-calc.component.html',
  styleUrls: ['./plate-calc.component.scss']
})
export class PlateCalcComponent implements OnInit {
  public fConfig: PlateCalcOverlayConfig;
  public floatMask = floatMask;
  public PlateList: Array<Hantelscheibe>;
  public HantelListe: Array<Hantel>
  public Satz: Satz;
  public Hantel: Hantel;


  constructor(
    public overlayRef: PlateCalcOverlayRef,
		public fDbModule: DexieSvcService,
		@Inject(cPlateCalcOverlayData) public aPlateCalcOverlayConfig: PlateCalcOverlayConfig

  ) {
    this.Satz = aPlateCalcOverlayConfig.satz;
    this.Hantel = aPlateCalcOverlayConfig.hantel; 
    this.HantelListe = this.fDbModule.LangHantelListe;

   }

  ngOnInit(): void {
  }

  close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
  }
  
  public SetWeightVorgabe(aEvent: any) {
    this.Satz.GewichtAusgefuehrt = aEvent.target.value;
  }

}
