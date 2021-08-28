import { ISession } from './../../Business/Session/Session';
import { Component, OnInit, Inject, InjectionToken, AfterViewInit,ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { cSessionStatsOverlayData, SessionOverlayRef } from '../services/session-overlay-service.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';




@Component({
    selector: "app-session-stats-overlay",
    templateUrl: "./session-stats-overlay.component.html",
    styleUrls: ["./session-stats-overlay.component.scss"],
})
export class SessionStatsOverlayComponent  implements AfterViewInit, OnInit {
    @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any>;
    private _overlayRef: OverlayRef;
    private _portal: TemplatePortal;
  

    constructor(
        public dialogRef: SessionOverlayRef,
        private _overlay: Overlay, private _viewContainerRef: ViewContainerRef,
        @Inject(cSessionStatsOverlayData) public sess: ISession,
        // @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any>
    ) {}

    ngOnInit(): void { }

    ngAfterViewInit() {
        this._portal = new TemplatePortal(this._dialogTemplate, this._viewContainerRef);
        this._overlayRef = this._overlay.create({
            positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
            hasBackdrop: true
        });
        this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
        
    }


    
    close() {
        if(this.dialogRef != null)
            this.dialogRef.close();
        this.dialogRef = null;
    }
}
