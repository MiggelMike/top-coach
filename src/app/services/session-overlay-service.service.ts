import { SessionStatsOverlayComponent } from './../session-stats-overlay/session-stats-overlay.component';
import { BaseOverlayRef } from 'src/app/services/global.service';
import { Session } from './../../Business/Session/Session';
import { Injectable, ElementRef, InjectionToken, ComponentRef, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef  } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';


export class SessionOverlayRef extends BaseOverlayRef {

}


export interface SessionOverlayConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    width?: string;
    height?: number;
    session?: Session,
    left?: number; 
    top?: number; 
}

export const cSessionStatsOverlayData = new InjectionToken<SessionOverlayConfig>('Session_Stats_Overlay_Component');

const DEFAULT_CONFIG: SessionOverlayConfig = {
    hasBackdrop: false,
    session: null,
}


@Injectable({
  providedIn: 'root'
})
export class SessionOverlayServiceService {
    public SessOverlayRef: OverlayRef = null;
    public SessionStatsOverlayComponent: SessionStatsOverlayComponent;
    
    constructor(
        private overlay: Overlay,
        private injector: Injector
    ) { }
    
    private createInjector(aConfig: SessionOverlayConfig, aSessionRef: SessionOverlayRef): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();
    
        // Set custom injection tokens
        injectionTokens.set(SessionOverlayRef, aSessionRef);
        injectionTokens.set(cSessionStatsOverlayData, aConfig.session);
    
        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }
    
    private attachDialogContainer(aOverlayRef: OverlayRef, aConfig: SessionOverlayConfig, aDialogRef: SessionOverlayRef):SessionStatsOverlayComponent {
        const injector = this.createInjector(aConfig, aDialogRef);
    
        const containerPortal = new ComponentPortal(SessionStatsOverlayComponent, null, injector);
        try {
            const containerRef: ComponentRef<SessionStatsOverlayComponent> = aOverlayRef.attach(containerPortal);
            return containerRef.instance;
        } catch (error) {
            alert(error);
            return null;
        } 
    }

    open(aConfig: SessionOverlayConfig = {}):SessionStatsOverlayComponent {
        const dialogConfig = { ...DEFAULT_CONFIG, ...aConfig };

        // Returns an OverlayRef which is a PortalHost
        this.SessOverlayRef = this.createOverlay(dialogConfig);
        const dialogRef = new SessionOverlayRef(this.SessOverlayRef);
        this.SessOverlayRef.backdropClick().subscribe(_ => this.close());
        this.SessionStatsOverlayComponent = this.attachDialogContainer(this.SessOverlayRef, dialogConfig, dialogRef);
        this.SessionStatsOverlayComponent.fConfig = aConfig;
        return this.SessionStatsOverlayComponent;
    }

    close() {
        this.SessionStatsOverlayComponent.close();
        //this.SessOverlayRef.dispose();
    }

    private getOverlayConfig(aConfig: SessionOverlayConfig): OverlayConfig {
        // const s = aConfig.left.toString() + 'px';
        const s = (window.outerWidth - aConfig.left).toString()  + 'px';
        const positionStrategy = this.overlay
        
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();

        const overlayConfig = new OverlayConfig({
            hasBackdrop: aConfig.hasBackdrop,
            backdropClass: aConfig.backdropClass,
            panelClass: aConfig.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            width: aConfig.width,
            positionStrategy,
        });

        return overlayConfig;
    }

    private createOverlay(aConfig: SessionOverlayConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(aConfig);
        

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }
}

