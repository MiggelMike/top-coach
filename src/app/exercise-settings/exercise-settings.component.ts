import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { floatMask } from './../app.module';
import { cExerciseOverlayData } from "./../services/exercise-setting-svc.service";
import { IUebung } from "./../../Business/Uebung/Uebung";
import { Component, Inject } from "@angular/core";
import { ExerciseOverlayConfig, ExerciseOverlayRef } from "../services/exercise-setting-svc.service";
import { ModalPositionService } from "../services/modal-position.service";
import { Progress, ProgressTyp } from 'src/Business/Progress/Progress';

@Component({
	selector: "app-exercise-settings",
	templateUrl: "./exercise-settings.component.html",
	styleUrls: ["./exercise-settings.component.scss"],
})
export class ExerciseSettingsComponent {
	public fConfig: ExerciseOverlayConfig;
	public floatMask = floatMask;
	public ProgressName: string;
	public ProgressListe: Array<Progress> = [];

	constructor(
		public overlayRef: ExerciseOverlayRef,
		public _ModalPositionService: ModalPositionService,
		public fDbModule: DexieSvcService,
		@Inject(cExerciseOverlayData)
		public SessUeb: IUebung) {
		
		this.fDbModule.LadeProgress(
			(p) =>
				this.ProgressListe = p
		);
	}

	onOkClick(): void {
		// this.dialogRef.close();
		// if (this.data.OkFn !== undefined)
		//     this.data.OkFn();
	}

	onCancelClick(): void {
		// this.dialogRef.close();
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
}
