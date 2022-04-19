import { Session } from './../../Business/Session/Session';
import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { BaseOverlayRef } from "src/app/services/global.service";
import { Injectable, InjectionToken, ComponentRef, Injector } from "@angular/core";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, PortalInjector } from "@angular/cdk/portal";
import { Uebung } from "src/Business/Uebung/Uebung";
import { ExerciseSettingsComponent } from "../exercise-settings/exercise-settings.component";

export class ExerciseOverlayRef extends BaseOverlayRef { }

export interface ExerciseOverlayConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
	width?: number;
	height?: number;
	uebung?: Uebung;
	programm?: ITrainingsProgramm;
	session?: Session;
	left?: number;
	top?: number;
	sofortSpeichern?: boolean;
}

export const cExerciseOverlayData = new InjectionToken<ExerciseOverlayConfig>("Exercise_Settings_Overlay_Component");

const DEFAULT_CONFIG: ExerciseOverlayConfig = {
	hasBackdrop: true,
	height: 400,
	width: 250,
	backdropClass: "dark-backdrop",
	uebung: null,
	programm: null,
	sofortSpeichern: false
	// panelClass: 'tm-file-preview-dialog-panel',

	//   `div {
	//     background-color: yellow;
	//     min-width: '400px !important';
	//     min-height: '400px !important';
	//     border: blue;
	//     border-width: thick;
	//     border-style: solid;
	// }`
};

@Injectable({
	providedIn: "root",
})
  
export class ExerciseSettingSvcService {
	public ExerciseOverlayRef: OverlayRef = null;
	public ExerciseSettingsComponent: ExerciseSettingsComponent;

  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {
	  
   }
  

	private createInjector(aConfig: ExerciseOverlayConfig, aExerciseRef: ExerciseOverlayRef): PortalInjector {
		// Instantiate new WeakMap for our custom injection tokens
		const injectionTokens = new WeakMap();

		// Set custom injection tokens
		injectionTokens.set(ExerciseOverlayRef, aExerciseRef);
		injectionTokens.set(cExerciseOverlayData, aConfig);

		// Instantiate new PortalInjector
		return new PortalInjector(this.injector, injectionTokens);
	}

	private attachDialogContainer(aOverlayRef: OverlayRef, aConfig: ExerciseOverlayConfig, aDialogRef: ExerciseOverlayRef): ExerciseSettingsComponent {
		const injector = this.createInjector(aConfig, aDialogRef);

		const containerPortal = new ComponentPortal(ExerciseSettingsComponent, null, injector);
		try {
			const containerRef: ComponentRef<ExerciseSettingsComponent> = aOverlayRef.attach(containerPortal);
			return containerRef.instance;
		} catch (error) {
			alert(error);
			return null;
		}
	}

	open(aConfig: ExerciseOverlayConfig = {}): ExerciseSettingsComponent {
		const dialogConfig = { ...DEFAULT_CONFIG, ...aConfig };

		// Returns an OverlayRef which is a PortalHost
		this.ExerciseOverlayRef = this.createOverlay(dialogConfig);
		const dialogRef = new ExerciseOverlayRef(this.ExerciseOverlayRef);
		this.ExerciseOverlayRef.backdropClick().subscribe((_) => this.close());
		this.ExerciseSettingsComponent = this.attachDialogContainer(this.ExerciseOverlayRef, dialogConfig, dialogRef);
		this.ExerciseSettingsComponent.fConfig = aConfig;
		return this.ExerciseSettingsComponent;
	}

	close() {
		this .ExerciseSettingsComponent.close();
	}

	private getOverlayConfig(aConfig: ExerciseOverlayConfig): OverlayConfig {
		const positionStrategy = this.overlay.position().global()
			.top(aConfig.top.toString() + "px")
			.centerHorizontally();
		

		const overlayConfig = new OverlayConfig({
			hasBackdrop: aConfig.hasBackdrop,
			backdropClass: aConfig.backdropClass,
			panelClass: aConfig.panelClass,
			scrollStrategy: this.overlay.scrollStrategies.reposition(),
			positionStrategy,
		});

		return overlayConfig;
	}

	private createOverlay(aConfig: ExerciseOverlayConfig) {
		// Returns an OverlayConfig
		const overlayConfig = this.getOverlayConfig(aConfig);

		// Returns an OverlayRef
		return this.overlay.create(overlayConfig);
	}
}
