import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { Hantel } from './../../Business/Hantel/Hantel';
import { DexieSvcService } from "src/app/services/dexie-svc.service";
import { floatMask, Int3DigitMask } from "./../app.module";
import { cExerciseOverlayData } from "./../services/exercise-setting-svc.service";
import { IUebung } from "./../../Business/Uebung/Uebung";
import { Component, Inject } from "@angular/core";
import { ExerciseOverlayConfig, ExerciseOverlayRef } from "../services/exercise-setting-svc.service";
import { Progress, ProgressGroup } from "src/Business/Progress/Progress";

@Component({
	selector: "app-exercise-settings",
	templateUrl: "./exercise-settings.component.html",
	styleUrls: ["./exercise-settings.component.scss"],
})
export class ExerciseSettingsComponent {
	public fConfig: ExerciseOverlayConfig;
	public floatMask = floatMask;
	public Int3DigitMask = Int3DigitMask;
	public ProgressName: string;
	public ProgressListe: Array<Progress> = [];
	public HantelListe: Array<Hantel> = [];
	public ProgressGroupListe: Array<string>;
	public Programm: ITrainingsProgramm;
	public SessUeb: IUebung;
	

	public datemask = {
		guide: true,
		showMask : true,
		mask: [/\d/, /\d/, '/', /\d/, /\d/, '/',/\d/, /\d/,/\d/, /\d/]
	};


	constructor(
		public overlayRef: ExerciseOverlayRef,
		public fDbModule: DexieSvcService,
		@Inject(cExerciseOverlayData)
		public aExerciseOverlayConfig:ExerciseOverlayConfig
	) {
		this.fDbModule.LadeProgress((p) => (this.ProgressListe = p));
		this.ProgressGroupListe = ProgressGroup;
		this.SessUeb = aExerciseOverlayConfig.uebung;
		this.Programm = aExerciseOverlayConfig.programm;
	}

	SetProgressGroup(aEvent:any) {
		this.SessUeb.ProgressGroup = aEvent.target.value;
		if (this.SessUeb.ProgressGroup.length > 0) {
			if (this.ProgressGroupListe.find((pg) => pg.toUpperCase() === this.SessUeb.ProgressGroup.toUpperCase()) === undefined)
				this.ProgressGroupListe.push(this.SessUeb.ProgressGroup);
		}
	}

	onExitSelectProgressGroup(aGroup: string) {
		this.SessUeb.ProgressGroup = aGroup;
	}

	SetAufwaermArbeitsSatzPause(aEvent: any) {
		this.SessUeb.AufwaermArbeitsSatzPause = aEvent.target.value;
	}

	SetArbeitsSatzPause1(aEvent: any) {
		this.SessUeb.ArbeitsSatzPause1 = aEvent.target.value;
	}

	SetArbeitsSatzPause2(aEvent: any) {
		this.SessUeb.ArbeitsSatzPause2 = aEvent.target.value;
	}

	SetNextExercisePause(aEvent: any) {
		this.SessUeb.NaechsteUebungPause = aEvent.target.value;
	}


	onOkClick(): void {
		// this.dialogRef.close();
		// if (this.data.OkFn !== undefined)
		//     this.data.OkFn();
	}

	onCancelClick(): void {
		// this.dialogRef.close();
	}

	get PauseTime1(): string{
		return '00:00:00';//this.SessUeb.PauseTime1;
	}

	get PauseTime2(): string{
		return '00:00:00';//this.SessUeb.PauseTime2;
	}
	
	get PauseTime(): string{
		return '00:00:00';//this.SessUeb.PauseTime2;
	}		

	close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
	}

	SetGewichtSteigerung(aEvent: any) {
		this.SessUeb.GewichtSteigerung = aEvent.target.value;
	}

	SetGewichtReduzierung(aEvent: any) {
		this.SessUeb.GewichtReduzierung = aEvent.target.value;
	}

	SetFailCount(aEvent: any) {
		this.SessUeb.FailCount = aEvent.target.value;
	}
}
