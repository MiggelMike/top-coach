import { Uebung } from 'src/Business/Uebung/Uebung';
import { DialogeService } from './../../services/dialoge.service';
import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
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
    extends ComponentCanDeactivate
    implements OnInit
{
    public Session: Session;
    public cmpSession: Session;

    constructor(
        private fRouter: Router,
        public fDexieSvcService: DexieSvcService,
        private fDialogService: DialogeService
    ) {
        super();
        const mNavigation = this.fRouter.getCurrentNavigation();
        const mState = mNavigation.extras.state as { sess: Session; };
        this.Session = mState.sess;
        this.cmpSession = mState.sess.Copy();
    }

    canDeactivate($event: any): Boolean {
        return this.Session.hasChanged(this.cmpSession) === false;
    }

    ngAfterViewInit() {}

    ngOnInit(): void {}

    public SaveChanges(aPara: any) {
        aPara.fDexieSvcService.SessionSpeichern(aPara.Session);
        aPara.cmpSession = aPara.Session.Copy();
    }

    public CancelChanges(aPara: SessionFormComponent) {
        if (aPara.Session.hasChanged(aPara.cmpSession) === false) return;

        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            const mUebungsListe: Array<Uebung> = new Array<Uebung>();
            aPara.Session.UebungsListe.forEach(u => mUebungsListe.push(u.Copy()));
            aPara.Session.UebungsListe = [];
            
            for (let index = 0; index < aPara.cmpSession.UebungsListe.length; index++) {
                const mUebung = aPara.cmpSession.UebungsListe[index].Copy();
                aPara.Session.UebungsListe.push(mUebung);
            }

            aPara.cmpSession = aPara.Session.Copy();

            for (let index = 0; index < mUebungsListe.length; index++) {
                const mUebung = mUebungsListe[index];
                const mUebung1 = (aPara.Session.UebungsListe.find(u => u.ID === mUebung.ID));
                if(mUebung1){
                    mUebung1.Expanded = mUebung.Expanded;
                    mUebung1.WarmUpVisible = mUebung.WarmUpVisible;
                    mUebung1.CooldownVisible = mUebung.CooldownVisible;
                }
            }

            aPara.DoStats();
        };

        aPara.fDialogService.JaNein(mDialogData);
    }

    public DoStats() {
        
    }
}
