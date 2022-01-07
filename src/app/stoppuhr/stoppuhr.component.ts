import { Component, Inject, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { cStoppUhrOverlayData, StoppUhrOverlayConfig, StoppUhrOverlayRef } from '../services/stoppuhr-svc.service';

@Component({
  selector: 'app-stoppuhr',
  templateUrl: './stoppuhr.component.html',
  styleUrls: ['./stoppuhr.component.scss']
})
export class StoppuhrComponent implements OnInit {
  public fConfig: StoppUhrOverlayConfig;


  constructor(public overlayRef:  StoppUhrOverlayRef, public fDbModule: DexieSvcService, @Inject(cStoppUhrOverlayData) public aPlateCalcOverlayConfig: StoppUhrOverlayConfig) { }

  ngOnInit(): void {
  }

  close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
	}

}
