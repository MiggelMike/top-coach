import { SessionStatsOverlayComponent } from './../session-stats-overlay/session-stats-overlay.component';
import { BaseOverlayRef } from 'src/app/services/global.service';
import { ISession, Session } from './../../Business/Session/Session';
import { Injectable, InjectionToken, ComponentRef, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef  } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

export class SessionOverlayRef extends BaseOverlayRef {}


export interface SessionOverlayConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    width?: number;
    height?: number;
    session?: Session
}

export const cSessionStatsOverlayData = new InjectionToken<ISession>('Session_Stats_Overlay_Component');

const DEFAULT_CONFIG: SessionOverlayConfig = {
    hasBackdrop: false,
    backdropClass: 'dark-backdrop',
    session: null
  // panelClass: 'tm-file-preview-dialog-panel',
      
        
    //   `div {
    //     background-color: yellow;
    //     min-width: '400px !important';
    //     min-height: '400px !important';
    //     border: blue;
    //     border-width: thick;
    //     border-style: solid;
    // }`
}


@Injectable({
  providedIn: 'root'
})
export class SessionOverlayServiceService {
    public SessOverlayRef: OverlayRef = null;

    constructor(private overlay: Overlay, private injector: Injector) { }
    
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
        } 
    }

    open(aConfig: SessionOverlayConfig = {}):SessionStatsOverlayComponent {
        const dialogConfig = { ...DEFAULT_CONFIG, ...aConfig };

        // Returns an OverlayRef which is a PortalHost
        this.SessOverlayRef = this.createOverlay(dialogConfig);
        const dialogRef = new SessionOverlayRef(this.SessOverlayRef);
        return this.attachDialogContainer(this.SessOverlayRef, dialogConfig, dialogRef);
      //  this.SessOverlayRef.backdropClick().subscribe(_ => dialogRef.close());
        // return this.SessOverlayRef;
    }

    close() {
        this.SessOverlayRef.dispose();
        this.SessOverlayRef = null;
    }

    private getOverlayConfig(aConfig: SessionOverlayConfig): OverlayConfig {
        const positionStrategy = this.overlay
            .position()
            .global()
            .top("100px")
            // .left("150px")
            // .right("150px");
        // .centerHorizontally()
        // .centerVertically();

        const overlayConfig = new OverlayConfig({
            hasBackdrop: aConfig.hasBackdrop,
            backdropClass: aConfig.backdropClass,
            panelClass: aConfig.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
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

