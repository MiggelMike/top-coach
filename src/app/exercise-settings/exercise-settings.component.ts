import { ProgressPara } from './../../Business/Progress/Progress';
import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { Hantel } from './../../Business/Hantel/Hantel';
import { DexieSvcService } from "src/app/services/dexie-svc.service";
import { floatMask, Int3DigitMask } from "./../app.module";
import { cExerciseOverlayData } from "./../services/exercise-setting-svc.service";
import { InUpcomingSessionSetzen, IUebung, Uebung } from "./../../Business/Uebung/Uebung";
import { Component,  Inject } from "@angular/core";
import { ExerciseOverlayConfig, ExerciseOverlayRef } from "../services/exercise-setting-svc.service";
import { Progress, ProgressGroup } from "src/Business/Progress/Progress";
import { SatzStatus } from 'src/Business/Satz/Satz';
import { ISession } from 'src/Business/Session/Session';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';

enum InUpcomingSessionSetzenTyp {
	Progress,
	ProgressGroup,
	WarmUpVisible, 
	CooldownVisible,
	IncludeWarmupWeight,
	IncludeCoolDownWeight,
	MaxFailCount,
	GewichtSteigerung,
	GewichtReduzierung,
	AufwaermArbeitsSatzPause,
	ArbeitsSatzPause1,
	ArbeitsSatzPause2,
	NaechsteUebungPause
}

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
	public CmpSessUeb: IUebung;
	


	constructor(
		public overlayRef: ExerciseOverlayRef,
		public fDbModule: DexieSvcService,
		private fDialogService: DialogeService,
		@Inject(cExerciseOverlayData)
		public fExerciseOverlayConfig:ExerciseOverlayConfig
	) {
		const mProgressPara: ProgressPara = new ProgressPara();
		mProgressPara.AfterLoadFn = (aProgressPara: ProgressPara ) => (this.ProgressListe = aProgressPara.ProgressListe);
		// mProgressPara.ProgressListe = this.ProgressListe;
		this.fDbModule.LadeProgress(mProgressPara);
		this.ProgressGroupListe = ProgressGroup;
		this.SessUeb = fExerciseOverlayConfig.uebung;
		this.CmpSessUeb = this.SessUeb.Copy();
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

	PrepForUpcomingSession(aInUpcomingSessionSetzen: InUpcomingSessionSetzen, aInUpcomingSessionSetzenTyp: InUpcomingSessionSetzenTyp, aValue: boolean) {
		switch (aInUpcomingSessionSetzenTyp) {
			case InUpcomingSessionSetzenTyp.Progress:
				aInUpcomingSessionSetzen.Progress = aValue;
				break;

				case InUpcomingSessionSetzenTyp.ProgressGroup:
					aInUpcomingSessionSetzen.ProgressGroup = aValue;
					break;
				
				case InUpcomingSessionSetzenTyp.WarmUpVisible:
					aInUpcomingSessionSetzen.WarmUpVisible = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.CooldownVisible:
					aInUpcomingSessionSetzen.CooldownVisible = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.IncludeWarmupWeight:
					aInUpcomingSessionSetzen.IncludeWarmupWeight = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.IncludeCoolDownWeight:
					aInUpcomingSessionSetzen.IncludeCoolDownWeight = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.MaxFailCount:
					aInUpcomingSessionSetzen.MaxFailCount = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.GewichtSteigerung:
					aInUpcomingSessionSetzen.GewichtSteigerung = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.GewichtReduzierung:
					aInUpcomingSessionSetzen.GewichtReduzierung = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.AufwaermArbeitsSatzPause:
					aInUpcomingSessionSetzen.AufwaermArbeitsSatzPause = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.ArbeitsSatzPause1:
					aInUpcomingSessionSetzen.ArbeitsSatzPause1 = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.ArbeitsSatzPause2:
					aInUpcomingSessionSetzen.ArbeitsSatzPause2 = aValue;
					break;
					
				case InUpcomingSessionSetzenTyp.NaechsteUebungPause:
					aInUpcomingSessionSetzen.NaechsteUebungPause = aValue;
					break;
		}//switch
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
		let mGeaendert: boolean = false;
		
		const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = true;

		
		if (this.SessUeb.WarmUpVisible !== this.CmpSessUeb.WarmUpVisible) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.WarmUpVisible,
				true);
		}
			
		if (this.SessUeb.CooldownVisible !== this.CmpSessUeb.CooldownVisible) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.CooldownVisible,
				true);
		}
				
		if (this.SessUeb.FkProgress !== this.CmpSessUeb.FkProgress) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.Progress,
				true);
		}
		
		if (this.SessUeb.ProgressGroup !== this.CmpSessUeb.ProgressGroup) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.ProgressGroup,
				true);
		}

		if (this.SessUeb.AufwaermArbeitsSatzPause !== this.CmpSessUeb.AufwaermArbeitsSatzPause) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.AufwaermArbeitsSatzPause,
				true);
		}

		if (this.SessUeb.ArbeitsSatzPause1 !== this.CmpSessUeb.ArbeitsSatzPause1) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.ArbeitsSatzPause1,
				true);
		}

		if (this.SessUeb.ArbeitsSatzPause2 !== this.CmpSessUeb.ArbeitsSatzPause2) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.ArbeitsSatzPause2,
				true);
		}

		if (this.SessUeb.GewichtReduzierung !== this.CmpSessUeb.GewichtReduzierung) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.GewichtReduzierung,
				true);
		}

		if (this.SessUeb.IncludeCoolDownWeight !== this.CmpSessUeb.IncludeCoolDownWeight) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.IncludeCoolDownWeight,
				true);
		}
		
		if (this.SessUeb.IncludeWarmupWeight !== this.CmpSessUeb.IncludeWarmupWeight) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.IncludeWarmupWeight,
				true);
		}
		
		if (this.SessUeb.MaxFailCount !== this.CmpSessUeb.MaxFailCount) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.MaxFailCount,
				true);
		}

		if (this.SessUeb.GewichtSteigerung !== this.CmpSessUeb.GewichtSteigerung) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.GewichtSteigerung,
				true);
		}

		if (this.SessUeb.NaechsteUebungPause !== this.CmpSessUeb.NaechsteUebungPause ) {
			mGeaendert = true;
			this.PrepForUpcomingSession(
				this.SessUeb.InUpcomingSessionSetzen,
				InUpcomingSessionSetzenTyp.NaechsteUebungPause,
				true);
		};

		if (mGeaendert) {
			mDialogData.textZeilen.push("Changes detected!");
			mDialogData.textZeilen.push("Use in upcoming sessions as well?");
				
			mDialogData.OkFn = () => {
				// Durchlaufe alle Sessions des Programms.
				this.Programm.SessionListe.forEach(async (mSession) => {
					// Die Session aus dem Formular ignorienn
					if (mSession.ID !== this.Session.ID) {
	                    // Prüfe alle Übungen der Session
						mSession.UebungsListe.forEach((mDestUebung) => {
							// Prüfe, ob es sich um die gleiche Übung wie die im Formular handelt. 
							if (mDestUebung.FkUebung === this.SessUeb.FkUebung &&
								mDestUebung.FkAltProgress === this.SessUeb.FkAltProgress &&
								mDestUebung.AltProgressGroup === this.SessUeb.AltProgressGroup) {
								//
								if (this.SessUeb.InUpcomingSessionSetzen.WarmUpVisible === true)
									mDestUebung.WarmUpVisible = this.SessUeb.WarmUpVisible;
									
								if (this.SessUeb.InUpcomingSessionSetzen.CooldownVisible === true)
									mDestUebung.CooldownVisible = this.SessUeb.CooldownVisible;
								
								if (this.SessUeb.InUpcomingSessionSetzen.Progress === true)
									mDestUebung.FkProgress = this.SessUeb.FkProgress;
										
								if (this.SessUeb.InUpcomingSessionSetzen.ProgressGroup === true)
									mDestUebung.ProgressGroup = this.SessUeb.ProgressGroup;
								
								if (this.SessUeb.InUpcomingSessionSetzen.AufwaermArbeitsSatzPause === true)
									mDestUebung.AufwaermArbeitsSatzPause = this.SessUeb.AufwaermArbeitsSatzPause;
						
								if (this.SessUeb.InUpcomingSessionSetzen.ArbeitsSatzPause1 === true)
									mDestUebung.ArbeitsSatzPause1 = this.SessUeb.ArbeitsSatzPause1;
								
								if (this.SessUeb.InUpcomingSessionSetzen.ArbeitsSatzPause2 === true)
									mDestUebung.ArbeitsSatzPause2 = this.SessUeb.ArbeitsSatzPause2;
						
								if (this.SessUeb.InUpcomingSessionSetzen.GewichtReduzierung === true)
									mDestUebung.GewichtReduzierung = this.SessUeb.GewichtReduzierung;
						
								if (this.SessUeb.InUpcomingSessionSetzen.IncludeWarmupWeight === true)
									mDestUebung.IncludeWarmupWeight = this.SessUeb.IncludeWarmupWeight;
								
								if (this.SessUeb.InUpcomingSessionSetzen.MaxFailCount === true)
									mDestUebung.MaxFailCount = this.SessUeb.MaxFailCount;
								
								if (this.SessUeb.InUpcomingSessionSetzen.GewichtSteigerung === true)
									mDestUebung.GewichtSteigerung = this.SessUeb.GewichtSteigerung;
								
								if (this.SessUeb.InUpcomingSessionSetzen.NaechsteUebungPause === true)
									mDestUebung.NaechsteUebungPause = this.SessUeb.NaechsteUebungPause;

								this.fDbModule.UebungSpeichern(mDestUebung);
							}
						});
					}//if
				});//foreach

				if (this.overlayRef != null) this.overlayRef.close();
				this.overlayRef = null;
			};

			mDialogData.CancelFn = () => {
				if (this.overlayRef != null) this.overlayRef.close();
				this.overlayRef = null;
			};

			this.fDialogService.JaNein(mDialogData);
		} else {
			if (this.overlayRef != null) this.overlayRef.close();
			this.overlayRef = null;
		}
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
