import { ISession } from './../../Business/Session/Session';
import { Component, OnInit, Inject, InjectionToken } from '@angular/core';
import { cSessionStatsOverlayData, SessionOverlayRef } from '../services/session-overlay-service.service';

@Component({
    selector: "app-session-stats-overlay",
    templateUrl: "./session-stats-overlay.component.html",
    styleUrls: ["./session-stats-overlay.component.scss"],
})
export class SessionStatsOverlayComponent  implements OnInit {

    constructor(
        public dialogRef: SessionOverlayRef,
        @Inject(cSessionStatsOverlayData) public sess: ISession
    ) {}

    ngOnInit(): void { }
    
    close() {
        this.dialogRef.close();
    }
}
