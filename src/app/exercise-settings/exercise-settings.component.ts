import { ProgressPara } from './../../Business/Progress/Progress';
import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { Hantel } from './../../Business/Hantel/Hantel';
import { DexieSvcService } from "src/app/services/dexie-svc.service";
import { floatMask, Int3DigitMask } from "./../app.module";
import { cExerciseOverlayData } from "./../services/exercise-setting-svc.service";
import { IUebung, Uebung } from "./../../Business/Uebung/Uebung";
import { Component, Inject } from "@angular/core";
import { ExerciseOverlayConfig, ExerciseOverlayRef } from "../services/exercise-setting-svc.service";
import { Progress, ProgressGroup } from "src/Business/Progress/Progress";
import { SatzStatus } from 'src/Business/Satz/Satz';
import { ISession } from 'src/Business/Session/Session';

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
	public Session: ISession;
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
		public fExerciseOverlayConfig:ExerciseOverlayConfig
	) {
		const mProgressPara: ProgressPara = new ProgressPara();
		mProgressPara.AfterLoadFn = (aProgressPara: ProgressPara ) => (this.ProgressListe = aProgressPara.ProgressListe);
		// mProgressPara.ProgressListe = this.ProgressListe;
		this.fDbModule.LadeProgress(mProgressPara);
		this.ProgressGroupListe = ProgressGroup;
		this.SessUeb = fExerciseOverlayConfig.uebung;
		this.Session = fExerciseOverlayConfig.session;
		this.Programm = fExerciseOverlayConfig.programm;
		this.fConfig = fExerciseOverlayConfig;
	}

	SetProgressGroup(aEvent:any) {
		this.SessUeb.ProgressGroup = aEvent.target.value;
		if (this.SessUeb.ProgressGroup.length > 0) {
			if (this.ProgressGroupListe.find((pg) => pg.toUpperCase() === this.SessUeb.ProgressGroup.toUpperCase()) === undefined)
				this.ProgressGroupListe.push(this.SessUeb.ProgressGroup);
		}
	}

	onChangeProgressSchema(aEvent: any) {
		const mProgressPara: ProgressPara = new ProgressPara();
		mProgressPara.DbModule = this.fDbModule;
		mProgressPara.Programm = this.Programm;
		mProgressPara.AusgangsSession = this.Session;
		mProgressPara.AusgangsUebung = this.SessUeb as Uebung;
		mProgressPara.AusgangsSatz = this.SessUeb.ArbeitsSatzListe.length > 0 ? this.SessUeb.ArbeitsSatzListe[0] : undefined;
		mProgressPara.SatzDone = this.SessUeb.ArbeitsSatzListe.length > 0 ? this.SessUeb.ArbeitsSatzListe[0].Status === SatzStatus.Fertig : false;
		mProgressPara.ProgressHasChanged = (this.SessUeb.FkProgress !== this.SessUeb.FkAltProgress) && (this.SessUeb.ArbeitsSatzListe[0].Status === SatzStatus.Fertig);
		mProgressPara.ProgressListe = this.fDbModule.ProgressListe;
		Progress.StaticDoProgress(mProgressPara);
		this.EvalSofortSpeichern();
	}

	SetAufwaermArbeitsSatzPause(aEvent: any) {
		this.SessUeb.AufwaermArbeitsSatzPause = aEvent.target.value;
		this.EvalSofortSpeichern();
	}

	SetArbeitsSatzPause1(aEvent: any) {
		this.SessUeb.ArbeitsSatzPause1 = aEvent.target.value;
		this.EvalSofortSpeichern();
	}

	SetArbeitsSatzPause2(aEvent: any) {
		this.SessUeb.ArbeitsSatzPause2 = aEvent.target.value;
		this.EvalSofortSpeichern();
	}

	SetNextExercisePause(aEvent: any) {
		this.SessUeb.NaechsteUebungPause = aEvent.target.value;
		this.EvalSofortSpeichern();
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
		this.EvalSofortSpeichern();
	}

	SetGewichtReduzierung(aEvent: any) {
		this.SessUeb.GewichtReduzierung = aEvent.target.value;
		this.EvalSofortSpeichern();
	}

	SetFailCount(aEvent: any) {
		this.SessUeb.MaxFailCount = aEvent.target.value;
		this.EvalSofortSpeichern();
	}

	private EvalSofortSpeichern() {
		if((this.fConfig.sofortSpeichern !== undefined) && (this.fConfig.sofortSpeichern === true))
			this.fDbModule.UebungSpeichern(this.SessUeb as Uebung);
	}

	SetWarmupVisible(aEvent: any) {
		this.SessUeb.WarmUpVisible = aEvent.checked;
		this.EvalSofortSpeichern();
	}

	SetIncludeWarmupWeight(aEvent: any) {
		this.SessUeb.IncludeWarmupWeight = aEvent.checked;
		this.EvalSofortSpeichern();
	}

	SetCooldownVisible(aEvent: any) {
		this.SessUeb.CooldownVisible = aEvent.checked;
		this.EvalSofortSpeichern();
	}

	SetIncludeCoolDownWeight(aEvent: any) {
		this.SessUeb.IncludeCoolDownWeight = aEvent.checked;
		this.EvalSofortSpeichern();
	}
}
