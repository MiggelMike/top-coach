import { SessionStatus, SessionDB } from './../../../Business/SessionDB';
import { Session } from 'src/Business/Session/Session';
import { SessionStatsOverlayComponent } from './../../session-stats-overlay/session-stats-overlay.component';
import { SessionOverlayServiceService, SessionOverlayConfig } from './../../services/session-overlay-service.service';
import { DialogeService } from './../../services/dialoge.service';
import { DexieSvcService } from './../../services/dexie-svc.service';
import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { Location } from "@angular/common";
import { GlobalService } from 'src/app/services/global.service';
import { Uebung } from 'src/Business/Uebung/Uebung';

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
    public BodyWeight: number = 0;
    public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;
    private fSessionOverlayConfig: SessionOverlayConfig;
    

    constructor(
        private router: Router,
        public fDexieSvcService: DexieSvcService,
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService,
        private fSessionOverlayServiceService: SessionOverlayServiceService,
        private location: Location
    ) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { sess: Session; };
        mState.sess.BodyWeightAtSessionStart = this.fDexieSvcService.getBodyWeight();
        this.Session = mState.sess.Copy();
        this.cmpSession = mState.sess.Copy();
        
        if ((this.Session.Kategorie02 === SessionStatus.Pause)
            || (this.Session.Kategorie02 === SessionStatus.Wartet)
            || (this.Session.Kategorie02 === SessionStatus.Laueft)
        )
            this.Session.StarteDauerTimer();
        
        this.fSessionOverlayConfig =
            {
                session: this.Session,
                left: -1000,
                top: -1000
            } as SessionOverlayConfig;
        
        this.doStats();
    }

    doStats() {
        if ((this.fSessionStatsOverlayComponent === null) || (this.fSessionStatsOverlayComponent.overlayRef === null)) 
            this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open(this.fSessionOverlayConfig);
        else 
            this.fSessionStatsOverlayComponent.close();
    }

    back() {
        if (this.Session.isEqual(this.cmpSession))
            this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Cancel unsaved changes?");
			mDialogData.OkFn = (): void => this.leave();

			this.fDialogService.JaNein(mDialogData);
		}

    }
    
    PasteExcercise() {
        if (this.fGlobalService.SessUebungKopie === null) {
            const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}
        
		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
        mSessUebung.SessionID = this.Session.ID;
        mSessUebung.ID = undefined;
		this.Session.UebungsListe.push(mSessUebung);
    }
    
    leave() {
        if (this.fSessionStatsOverlayComponent != null)
            this.fSessionStatsOverlayComponent.close();
        this.location.back();
    }

    ngAfterViewInit() {
        this.cmpSession = this.Session.Copy();
    }

    ngOnInit(): void {
        this.BodyWeight = this.fDexieSvcService.getBodyWeight();
    }

    public SaveChanges(aPara: any) {
        aPara.fDexieSvcService.SessionSpeichern(aPara.Session);
        const mSession: Session = (aPara.Session);
        const mCmpSession: Session = (aPara.cmpSession);
        // Die aus der Session gelöschten Übungen auch aus der DB löschen.
        for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
            const mUebung = mCmpSession.UebungsListe[index];
            const mSuchUebung = mSession.UebungsListe.find( u => u.ID === mUebung.ID)
            if (mSuchUebung === undefined)
                aPara.fDexieSvcService.UebungTable.delete(mUebung.ID);
        };

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

    public SetPause():void {
        this.Session.Kategorie02 = SessionStatus.Pause;
    }

    public SetDone(): void {
        this.fSessionStatsOverlayComponent.sess.SetSessionFertig();
    }

    public PauseButtonVisible(): Boolean {
        return (this.Session.Kategorie02 !== SessionStatus.Fertig) && (this.Session.Kategorie02 !== SessionStatus.FertigTimeOut);
    }

}
