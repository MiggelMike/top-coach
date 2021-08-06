import { SessionStatus, SessionDB } from './../../../Business/SessionDB';
import { Session } from 'src/Business/Session/Session';
import { SessionStatsOverlayComponent } from './../../session-stats-overlay/session-stats-overlay.component';
import { SessionOverlayServiceService, SessionOverlayConfig } from './../../services/session-overlay-service.service';
import { DialogeService } from './../../services/dialoge.service';
import { DexieSvcService } from './../../services/dexie-svc.service';
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
    public cmpSession: SessionDB;
    public BodyWeight: number = 0;
    public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;


    constructor(
        private router: Router,
        public fDexieSvcService: DexieSvcService,
        private fDialogService: DialogeService,
        private fSessionOverlayServiceService: SessionOverlayServiceService
    ) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { sess: Session; };
        mState.sess.BodyWeightAtSessionStart = this.fDexieSvcService.getBodyWeight();
        this.Session = mState.sess;
        if (   (this.Session.Kategorie02 === SessionStatus.Pause)
            || (this.Session.Kategorie02 === SessionStatus.Wartet)
            || (this.Session.Kategorie02 === SessionStatus.Laueft)
        )
            this.Session.StarteDauerTimer();
        this.doStats();
    }

    doStats() {
        if ((this.fSessionStatsOverlayComponent === null)||(this.fSessionStatsOverlayComponent.dialogRef === null))
            this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open({ session: this.Session } as SessionOverlayConfig);
        else 
            this.fSessionStatsOverlayComponent.close();
    }

    leave(aNavPath: string, aPara: any) {
        if (aPara.Session.Kategorie02 === SessionStatus.Laueft) 
            aPara.Session.AddPause();
        

        aPara.SaveChanges(aPara);
        if(aPara.fSessionStatsOverlayComponent != null)
            aPara.fSessionStatsOverlayComponent.close();
        // this.router.navigate([aNavPath]);        
        this.router.navigate([aNavPath], { state: { sess: aPara.Session } } );
        // if (aPara.Session.hasChanged(aPara.cmpSession) === false) {
        //     if(aPara.fSessionStatsOverlayComponent != null)
        //         aPara.fSessionStatsOverlayComponent.close();
        //     this.router.navigate([aNavPath] );
        // } else {
        //     if(aPara.fSessionStatsOverlayComponent != null)
        //         aPara.fSessionStatsOverlayComponent.close();
        //     aPara.CancelChanges(aPara, aNavPath);
        // }
    }

    ngAfterViewInit() {
        this.cmpSession = this.Session.Copy();
    }

    ngOnInit(): void {
        this.BodyWeight = this.fDexieSvcService.getBodyWeight();
    }

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
