import { Zeitraum } from './../../Business/Dauer';
import { SatzTyp } from './../../Business/Satz/Satz';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Satz } from 'src/Business/Satz/Satz';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { DexieSvcService } from '../services/dexie-svc.service';
import { cStoppUhrOverlayData, StoppUhrOverlayConfig, StoppUhrOverlayRef } from '../services/stoppuhr-svc.service';

@Component({
	selector: "app-stoppuhr",
	templateUrl: "./stoppuhr.component.html",
	styleUrls: ["./stoppuhr.component.scss"],
})
export class StoppuhrComponent implements OnInit {
	public fConfig: StoppUhrOverlayConfig;
	public Satz: Satz;
	public Uebung: Uebung;
	public SatzListenNr: number;
	public StartZeitpunkt: Date;
	private Gong = new Audio();
	private SoundEasyPlayed: boolean = false;
	private SoundHardPlayed: boolean = false;
	public NextSetText: string;
	public showDuration: boolean = false;

	constructor(
		private cd: ChangeDetectorRef,
		public overlayRef: StoppUhrOverlayRef, public fDbModule: DexieSvcService, @Inject(cStoppUhrOverlayData) public aStoppUhrOverlayConfig: StoppUhrOverlayConfig)
	{
		this.Satz = aStoppUhrOverlayConfig.satz;
		this.Uebung = aStoppUhrOverlayConfig.uebung;
		this.SatzListenNr = aStoppUhrOverlayConfig.satznr;
		this.StartZeitpunkt = new Date();
		this.NextSetText = aStoppUhrOverlayConfig.headerText;
		// ../../../assets/audio/alarm.wav
		this.Gong.src = "../../assets/sounds/Gong.mp3";
		this.Gong.load();
	}

	ngOnInit(): void {
		this.showDuration = true;
	}

	close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
	}

	get ScheduledPauseTimeEasy(): string {
		return Zeitraum.FormatDauer(this.Uebung.ArbeitsSatzPause1);
	}

	get ScheduledPauseSecondsEasy(): number {
		return this.Uebung.ArbeitsSatzPause1;
	}

	get ScheduledPauseTimeHard(): string {
		return Zeitraum.FormatDauer(this.Uebung.ArbeitsSatzPause2);
	}

	get ScheduledPauseSecondsHard(): number {
		return this.Uebung.ArbeitsSatzPause2;
	}

	
	ngAfterViewChecked(){
		this.cd.detectChanges();
	  }
        


	get PauseTime(): string {
		const mDauerSec: number = Zeitraum.CalcDauer(this.StartZeitpunkt, new Date());

		if (   this.Uebung.ArbeitsSatzPause1 > 0
			&& mDauerSec >= this.Uebung.ArbeitsSatzPause1
			&& this.SoundEasyPlayed === false)
		{
			this.SoundEasyPlayed = true;
			this.Gong.play();
		}

		if (   this.Uebung.ArbeitsSatzPause2 > 0
			&& mDauerSec >= this.Uebung.ArbeitsSatzPause2
			&& this.SoundHardPlayed === false)
		{
			this.SoundHardPlayed = true;
			this.Gong.play();
		}
	
		return Zeitraum.FormatDauer(mDauerSec);
	}
}
