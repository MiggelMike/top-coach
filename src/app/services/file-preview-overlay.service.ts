import { FilePreviewOverlayComponent } from './../file-preview-overlay/file-preview-overlay.component';
import { Injectable } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

interface FilePreviewDialogConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
  width?: number,
  height?: number,
}

const DEFAULT_CONFIG: FilePreviewDialogConfig = {
  hasBackdrop: false,
  backdropClass: 'dark-backdrop',
  // panelClass: 'tm-file-preview-dialog-panel',
  panelClass: 
      `div {
        background-color: yellow;
        min-width: '400px !important';
        min-height: '400px !important';
        border: blue;
        border-width: thick;
        border-style: solid;
    }`
}

@Injectable(
  // { providedIn: 'root' }
)
export class FilePreviewOverlayService {

  public OverlayRef: any;

  constructor(private overlay: Overlay) { }

  open(config: FilePreviewDialogConfig = {}) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);
    this.OverlayRef = overlayRef;

    // Create ComponentPortal that can be attached to a PortalHost
    const filePreviewPortal = new ComponentPortal(FilePreviewOverlayComponent);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(filePreviewPortal);

    setTimeout(() => {
      overlayRef.dispose();
    }, 6000);

    return overlayRef;
  }

  private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .global()
      .left('50px')
      .right('50px');
      // .centerHorizontally()
      // .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy
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
