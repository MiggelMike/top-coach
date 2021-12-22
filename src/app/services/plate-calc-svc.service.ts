import { Uebung } from './../../Business/Uebung/Uebung';
import { Hantel } from "./../../Business/Hantel/Hantel";
import { PlateCalcComponent } from "./../plate-calc/plate-calc.component";
import { BaseOverlayRef } from "src/app/services/global.service";
import { Injectable, InjectionToken, ComponentRef, Injector } from "@angular/core";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, PortalInjector } from "@angular/cdk/portal";
import { Satz } from "src/Business/Satz/Satz";

export class PlateCalcOverlayRef extends BaseOverlayRef {}

export interface PlateCalcOverlayConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
	width?: number;
	height?: number;
	satz?: Satz;
	uebung?: Uebung;
	left?: number;
	top?: number;
}

export const cPlateCalcOverlayData = new InjectionToken<Satz>("PlateCalc_Overlay_Component");

const DEFAULT_CONFIG: PlateCalcOverlayConfig = {
	hasBackdrop: true,
	height: 100,
	width: 100,
	backdropClass: "dark-backdrop",
	satz: null,
};

@Injectable({
	providedIn: "root",
})
	
export class PlateCalcSvcService {
	public PlateCalcOverlayRef: OverlayRef = null;
	public PlateCalcComponent: PlateCalcComponent;

	constructor(private overlay: Overlay, private injector: Injector) {}

	private createInjector(aConfig: PlateCalcOverlayConfig, aPlateCalcOverlayRef: PlateCalcOverlayRef): PortalInjector {
		// Instantiate new WeakMap for our custom injection tokens
		const injectionTokens = new WeakMap();

		// Set custom injection tokens
		injectionTokens.set(PlateCalcOverlayRef, aPlateCalcOverlayRef);
		injectionTokens.set(cPlateCalcOverlayData, aConfig);

		// Instantiate new PortalInjector
		return new PortalInjector(this.injector, injectionTokens);
	}

	private attachDialogContainer(aOverlayRef: OverlayRef, aConfig: PlateCalcOverlayConfig, aDialogRef: PlateCalcOverlayRef): PlateCalcComponent {
		const injector = this.createInjector(aConfig, aDialogRef);

		const containerPortal = new ComponentPortal(PlateCalcComponent, null, injector);
		try {
			const containerRef: ComponentRef<PlateCalcComponent> = aOverlayRef.attach(containerPortal);
			return containerRef.instance;
		} catch (error) {
			alert(error);
			return null;
		}
	}

	open(aConfig: PlateCalcOverlayConfig = {}): PlateCalcComponent {
		const dialogConfig = { ...DEFAULT_CONFIG, ...aConfig };

		// Returns an OverlayRef which is a PortalHost
		this.PlateCalcOverlayRef = this.createOverlay(dialogConfig);
		const dialogRef = new PlateCalcOverlayRef(this.PlateCalcOverlayRef);
		this.PlateCalcOverlayRef.backdropClick().subscribe((_) => this.close());
		this.PlateCalcComponent = this.attachDialogContainer(this.PlateCalcOverlayRef, dialogConfig, dialogRef);
		this.PlateCalcComponent.fConfig = aConfig;
		return this.PlateCalcComponent;
	}

	close() {
		this.PlateCalcComponent.close();
	}

	private getOverlayConfig(aConfig: PlateCalcOverlayConfig): OverlayConfig {
		const positionStrategy = this.overlay
			.position()
			.global()
			// .top(aConfig.top.toString() + "px")
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

	private createOverlay(aConfig: PlateCalcOverlayConfig) {
		// Returns an OverlayConfig
		const overlayConfig = this.getOverlayConfig(aConfig);

		// Returns an OverlayRef
		return this.overlay.create(overlayConfig);
	}
}
