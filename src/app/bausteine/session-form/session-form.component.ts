import { GlobalService } from 'src/app/services/global.service';
import { SessionStatsOverlayComponent } from './../../session-stats-overlay/session-stats-overlay.component';
import { SessionOverlayServiceService, SessionOverlayConfig } from './../../services/session-overlay-service.service';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { DialogeService } from './../../services/dialoge.service';
import { DexieSvcService } from './../../services/dexie-svc.service';
import { Session } from "./../../../Business/Session/Session";
import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';

@Component({
    selector: "app-session-form",
    templateUrl: "./session-form.component.html",
    styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent
    implements OnInit
    {
    public Session: Session;
    public cmpSession: Session;
    public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;


    constructor(
        private router: Router,
        public fDexieSvcService: DexieSvcService,
        private fDialogService: DialogeService,
        private fSessionOverlayServiceService: SessionOverlayServiceService
    ) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { sess: Session; };
        this.Session = mState.sess;
    }

    doStats() {
        if ((this.fSessionStatsOverlayComponent === null)||(this.fSessionStatsOverlayComponent.dialogRef === null))
            this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open({ session: this.Session } as SessionOverlayConfig);
        else 
            this.fSessionStatsOverlayComponent.close();
    }

    leave(aNavPath: string, aPara: any) {
        if (aPara.Session.hasChanged(aPara.cmpSession) === false) {
            if(aPara.fSessionStatsOverlayComponent != null)
                aPara.fSessionStatsOverlayComponent.close();
            this.router.navigate([aNavPath] );
        } else {
            if(aPara.fSessionStatsOverlayComponent != null)
                aPara.fSessionStatsOverlayComponent.close();
            aPara.CancelChanges(aPara, aNavPath);
        }
    }

    ngAfterViewInit() {
        this.cmpSession = this.Session.Copy();
    }

    ngOnInit(): void {}

    public SaveChanges(aPara: any) {
        aPara.fDexieSvcService.SessionSpeichern(aPara.Session);
        aPara.cmpSession = aPara.Session.Copy();
    }

    public CancelChanges(aPara: SessionFormComponent, aNavRoute: string) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            aPara.Session.resetSession(aPara.cmpSession);
            this.router.navigate([aNavRoute]);
        };
    
        this.fDialogService.JaNein(mDialogData);
    }
}
