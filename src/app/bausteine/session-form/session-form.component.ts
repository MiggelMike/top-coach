import { NavbarService } from './../../services/navbar.service';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { DialogeService } from './../../services/dialoge.service';
import { DexieSvcService } from './../../services/dexie-svc.service';
import { Session } from "./../../../Business/Session/Session";
import { Input, Component, OnInit } from "@angular/core";
import { Router, Event } from '@angular/router';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';

interface IBeforeNav{
    (aPara?: any): void;
}

@Component({
    selector: "app-session-form",
    templateUrl: "./session-form.component.html",
    styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent
    implements OnInit
    {
    @Input() doBeforeNav: IBeforeNav = null;
    public Session: Session;
    public cmpSession: Session;

    constructor(
        private router: Router,
        public fDexieSvcService: DexieSvcService,
        private fDialogService: DialogeService,
        public NavbarService: NavbarService
    ) {
        this.NavbarService.visible = false;
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { sess: Session; };
        this.Session = mState.sess;
    }


    leave(aNavPath: string, aPara: any) {
        if (aPara.Session.hasChanged(aPara.cmpSession) === false) {
            this.router.navigate([aNavPath] );
        } else {
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
            const mUebungsListe: Array<Uebung> = new Array<Uebung>();
            aPara.Session.UebungsListe.forEach(u => mUebungsListe.push(u.Copy()));
            aPara.Session.UebungsListe = [];
            
            for (let index = 0; index < aPara.cmpSession.UebungsListe.length; index++) {
                const mUebung = aPara.cmpSession.UebungsListe[index].Copy();
                aPara.Session.UebungsListe.push(mUebung);
            }

            for (let index = 0; index < mUebungsListe.length; index++) {
                const mUebung = mUebungsListe[index];
                const mUebung1 = (aPara.Session.UebungsListe.find(u => u.ID === mUebung.ID));
                if(mUebung1){
                    mUebung1.Expanded = mUebung.Expanded;
                    mUebung1.WarmUpVisible = mUebung.WarmUpVisible;
                    mUebung1.CooldownVisible = mUebung.CooldownVisible;
                }
            }
            
            this.router.navigate([aNavRoute] );
        };

        aPara.fDialogService.JaNein(mDialogData);
    }
}
