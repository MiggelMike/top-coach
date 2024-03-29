import { onFormShowFn, onFormCloseFn } from './dexie-svc.service';
import { Injectable, ComponentRef, Injector, InjectionToken } from "@angular/core";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, PortalInjector } from "@angular/cdk/portal";
import { Satz } from "src/Business/Satz/Satz";
import { Uebung } from "src/Business/Uebung/Uebung";
import { StoppuhrComponent } from "../stoppuhr/stoppuhr.component";
import { BaseOverlayRef } from "./global.service";
import { ISession } from 'src/Business/Session/Session';


export class StoppUhrOverlayRef extends BaseOverlayRef {}

export interface StoppUhrOverlayConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
	width?: number;
	height?: number;
	satz?: Satz;
	uebung?: Uebung;
	session?: ISession,
	left?: number;
	satznr?: number;
	nextTimeWeight?: number;
    top?: number;
	headerText?: string;
	NaechsteUebungPauseSec?: number;
	AufwaermArbeitsSatzPauseSec?: number;
	afterOpenFn?: onFormShowFn;
	beforeCloseFn?: onFormCloseFn;
}

export const cStoppUhrOverlayData = new InjectionToken<Satz>("StoppUhr_Overlay_Component");

const DEFAULT_CONFIG: StoppUhrOverlayConfig = {
	hasBackdrop: false,
	height: 200,
	width: 100,
	// backdropClass: "dark-backdrop",
	satz: null!,
	satznr: 0,
	nextTimeWeight: 0 
};


@Injectable({
  providedIn: 'root'
})
export class StoppuhrSvcService {

	public StoppuhrOverlayRef: OverlayRef|null = null;
	public StoppuhrComponent!: StoppuhrComponent;
	private DialogConfig = { ...DEFAULT_CONFIG };

	constructor(private overlay: Overlay, private injector: Injector) {}

	private createInjector(aConfig: StoppUhrOverlayConfig, aStoppUhrOverlayRef: StoppUhrOverlayRef): PortalInjector {
		// Instantiate new WeakMap for our custom injection tokens
		const injectionTokens = new WeakMap();

		// Set custom injection tokens
		injectionTokens.set(StoppUhrOverlayRef, aStoppUhrOverlayRef);
		injectionTokens.set(cStoppUhrOverlayData, aConfig);

		// Instantiate new PortalInjector
		return new PortalInjector(this.injector, injectionTokens);
	}

	private attachDialogContainer(aOverlayRef: OverlayRef, aConfig: StoppUhrOverlayConfig, aDialogRef: StoppUhrOverlayRef): StoppuhrComponent {
		const injector = this.createInjector(aConfig, aDialogRef);

		const containerPortal = new ComponentPortal(StoppuhrComponent, null, injector);
		try {
			const containerRef: ComponentRef<StoppuhrComponent> = aOverlayRef.attach(containerPortal);
			return containerRef.instance;
		} catch (error) {
			alert(error);
			return null!;
		}
	}

	open(aConfig: StoppUhrOverlayConfig = {}): StoppuhrComponent {
		this.DialogConfig  = { ...DEFAULT_CONFIG, ...aConfig };

		this.StoppuhrOverlayRef = this.createOverlay(this.DialogConfig);
		const dialogRef = new StoppUhrOverlayRef(this.StoppuhrOverlayRef);
		this.StoppuhrOverlayRef.backdropClick().subscribe((_) => this.close());
		this.StoppuhrComponent = this.attachDialogContainer(this.StoppuhrOverlayRef, this.DialogConfig, dialogRef);
		this.StoppuhrComponent.fConfig = aConfig;
		
		if (aConfig.afterOpenFn !== undefined)
			aConfig.afterOpenFn(this.StoppuhrComponent);
		
		return this.StoppuhrComponent;
	}

	close() {
		this.StoppuhrComponent.close();
		this.StoppuhrComponent = undefined!;

		if (this.DialogConfig.beforeCloseFn !== undefined)
			this.DialogConfig.beforeCloseFn(this.StoppuhrComponent);
	}

	private getOverlayConfig(aConfig: StoppUhrOverlayConfig): OverlayConfig {
		const positionStrategy = this.overlay
			.position()
			.global()
			.centerVertically()
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

	private createOverlay(aConfig: StoppUhrOverlayConfig) {
		// Returns an OverlayConfig
		const overlayConfig = this.getOverlayConfig(aConfig);

		// Returns an OverlayRef
		return this.overlay.create(overlayConfig);
	}

}
