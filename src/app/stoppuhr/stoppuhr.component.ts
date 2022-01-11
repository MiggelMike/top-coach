import { Zeitraum } from './../../Business/Dauer';
import { SatzTyp } from './../../Business/Satz/Satz';
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
  public SatzListenNr: number;
  public StartZeitpunkt: Date;


  constructor(public overlayRef: StoppUhrOverlayRef, public fDbModule: DexieSvcService, @Inject(cStoppUhrOverlayData) public aStoppUhrOverlayConfig: StoppUhrOverlayConfig) {
    this.Satz = aStoppUhrOverlayConfig.satz;
    this.Uebung = aStoppUhrOverlayConfig.uebung;
    this.SatzListenNr = aStoppUhrOverlayConfig.satznr;
    this.StartZeitpunkt = new Date();
    // this.Dauer = new Zeitraum(new Date(), )
    //Zeitraum.CalcDauer()

   }

  ngOnInit(): void {
  }

  close() {
    if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
  }
  
  get ScheduledPauseTimeEasy(): string{
    return Zeitraum.FormatDauer(this.Uebung.ArbeitsSatzPause1);
  }

  get ScheduledPauseSecondsEasy(): number{
    return this.Uebung.ArbeitsSatzPause1;
 }
  
  get ScheduledPauseTimeHard(): string{
    return Zeitraum.FormatDauer(this.Uebung.ArbeitsSatzPause2);
  }

  get ScheduledPauseSecondsHard(): number{
     return this.Uebung.ArbeitsSatzPause2;
  }
  
  
  
  get PauseTime(): string{
    return Zeitraum.FormatDauer(Zeitraum.CalcDauer(this.StartZeitpunkt,new Date()));
  }


}
