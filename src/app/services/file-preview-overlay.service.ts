import { ISession, Session } from './../../Business/Session/Session';
import { FilePreviewOverlayComponent } from './../file-preview-overlay/file-preview-overlay.component';
import { Injectable, InjectionToken, ComponentRef, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef  } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector  } from '@angular/cdk/portal';

export interface FilePreviewDialogConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    width?: number;
    height?: number;
    session?: Session
}

export const FILE_PREVIEW_DIALOG_DATA = new InjectionToken<Session>('FILE_PREVIEW_DIALOG_DATA');

export class FilePreviewOverlayRef {

    constructor(private overlayRef: OverlayRef) { }
  
    close(): void {
      this.overlayRef.dispose();
    }
  }

const DEFAULT_CONFIG: FilePreviewDialogConfig = {
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

@Injectable({ providedIn: "root" })
export class FilePreviewOverlayService {

    public SessOverlayRef: OverlayRef = null;
    

    constructor(private overlay: Overlay, private injector: Injector) { }
    
    private createInjector(config: FilePreviewDialogConfig, dialogRef: FilePreviewOverlayRef): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();
    
        // Set custom injection tokens
        injectionTokens.set(FilePreviewOverlayRef, dialogRef);
        injectionTokens.set(FILE_PREVIEW_DIALOG_DATA, config.session);
    
        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }
    
    private attachDialogContainer(overlayRef: OverlayRef, config: FilePreviewDialogConfig, dialogRef: FilePreviewOverlayRef) {
        const injector = this.createInjector(config, dialogRef);
    
        const containerPortal = new ComponentPortal(FilePreviewOverlayComponent, null, injector);
        try {
            const containerRef: ComponentRef<FilePreviewOverlayComponent> = overlayRef.attach(containerPortal);
            return containerRef.instance;
        } catch (error) {
            alert(error);
            return null;
        } 
    }
    

    open(config: FilePreviewDialogConfig = {}) {
        const dialogConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef which is a PortalHost
        this.SessOverlayRef = this.createOverlay(dialogConfig);
        const dialogRef = new FilePreviewOverlayRef(this.SessOverlayRef);
        this.attachDialogContainer(this.SessOverlayRef, dialogConfig, dialogRef);
      //  this.SessOverlayRef.backdropClick().subscribe(_ => dialogRef.close());
        return this.SessOverlayRef;
    }

    close() {
        this.SessOverlayRef.dispose();
        this.SessOverlayRef = null;
    }

    private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
        const positionStrategy = this.overlay
            .position()
            .global()
            .left("150px")
            .right("150px");
        // .centerHorizontally()
        // .centerVertically();

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            panelClass: config.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            positionStrategy,
        });

        return overlayConfig;
    }

    private createOverlay(config: FilePreviewDialogConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }
}
