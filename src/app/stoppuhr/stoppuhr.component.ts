import { Component, Inject, OnInit } from '@angular/core';
import { Satz } from 'src/Business/Satz/Satz';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { DexieSvcService } from '../services/dexie-svc.service';
import { cStoppUhrOverlayData, StoppUhrOverlayConfig, StoppUhrOverlayRef } from '../services/stoppuhr-svc.service';

@Component({
  selector: 'app-stoppuhr',
  templateUrl: './stoppuhr.component.html',
  styleUrls: ['./stoppuhr.component.scss']
})
export class StoppuhrComponent implements OnInit {
  public fConfig: StoppUhrOverlayConfig;
  public Satz: Satz;
  public Uebung: Uebung;


  constructor(public overlayRef: StoppUhrOverlayRef, public fDbModule: DexieSvcService, @Inject(cStoppUhrOverlayData) public aStoppUhrOverlayConfig: StoppUhrOverlayConfig) {
    this.Satz = aStoppUhrOverlayConfig.satz;
    this.Uebung = aStoppUhrOverlayConfig.uebung;

   }

  ngOnInit(): void {
  }

  close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
  }
  

  get PauseTime():string{
    return '00:00:00';
  }


}
