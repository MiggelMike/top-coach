import { ISession } from "src/Business/Session/Session";
import { ISessionDB } from "./../../../Business/SessionDB";
import { SessionStatus } from "../../../Business/SessionDB";
import { UebungWaehlenData } from "./../../uebung-waehlen/uebung-waehlen.component";
import { UebungsKategorie02 } from "./../../../Business/Uebung/Uebung";
import { DexieSvcService } from "./../../services/dexie-svc.service";
import { Session } from "./../../../Business/Session/Session";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Output, EventEmitter, Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { of } from "rxjs";
import { Uebung, IUebung } from "src/Business/Uebung/Uebung";
import { UebungService } from "src/app/services/uebung.service";
import { Router  } from "@angular/router";

@Component({
	selector: "app-programm02",
	templateUrl: "./programm02.component.html",
	styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
	@Input() programm: ITrainingsProgramm = null;
	@Output() ProgrammSavedEvent = new EventEmitter<ITrainingsProgramm>();
	@Input() SessionListe: Array<ISession> = [];
	@Input() showButtons: Boolean = false;
	@Input() showSaveButtons: Boolean = false;
	@Input() bearbeitbar: Boolean = false;
	@Input() StartButtonVisible: boolean = false;
	@Input() SessionPanelsExpanded: boolean = false;
	@Input() showWarmUpCheckBox: Boolean = true;
	@Input() showCoolDownCheckBox: Boolean = true;
	@ViewChildren("accSession") accSession: QueryList<MatAccordion>;
	@ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;

	private isExpanded: Boolean = true;
	public ToggleButtonText: string;
	public ClickData: Programm02Component;

	public SessionPanelsExpanded1(): Boolean {
		if (this.SessionPanelsExpanded === true) return true;
		return false;
	}

	public StartButtonText(aSess: ISession): string {
		if (aSess.Kategorie02 === undefined) aSess.Kategorie02 = SessionStatus.Wartet;

		switch (aSess.Kategorie02) {
			case SessionStatus.Wartet:
				return "Start";
			case SessionStatus.Laueft:
			case SessionStatus.Pause:
				return "Go ahead";
			case SessionStatus.Fertig:
			case SessionStatus.FertigTimeOut:
				return "Finished";
			default:
				return "?";
		}
	}

	constructor(private fDialogService: DialogeService, private fGlobalService: GlobalService, private fUebungService: UebungService, public fDbModule: DexieSvcService, private router: Router) {}

	ngAfterViewInit() {
		this.panUebung.forEach((pan) => {
			pan.expanded = this.SessionPanelsExpanded;
		});
	}

	ngOnInit() {}

	public CopySession(aSession: ISession) {
		//     this.fGlobalService.SessionKopie = aSession.Copy();
	}

	public DeleteSession(aSession: ISession, aRowNum: number) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete session #${aRowNum + 1} "${aSession.Name}" ?`);
		mDialogData.OkFn = (): void => {
			const index: number = this.SessionListe.indexOf(aSession);
			if (index !== -1) {
				this.SessionListe.splice(index, 1);
			}

			if (this.fGlobalService.Comp03PanelUebungObserver != null) {
				//this.panUebung.expanded = false;
				of(this.panUebung).subscribe(this.fGlobalService.Comp03PanelUebungObserver);
			}
		};

		this.fDialogService.JaNein(mDialogData);
	}

	// Wird an "AddExercise" als Parameter uebergeben
	private SelectUebungDelegate(aUebungWaehlenData: UebungWaehlenData) {
		aUebungWaehlenData.fUebungsListe.forEach((mUebung) => {
			if (mUebung.Selected) {
				aUebungWaehlenData.fSession.addUebung(Uebung.StaticKopiere(mUebung, UebungsKategorie02.Session));
			}
		});
		aUebungWaehlenData.fMatDialog.close();
	}

	public AddExercise(aSession: ISession) {
		if (this.fDbModule.StammUebungsListe.length === 0) this.fDbModule.LadeStammUebungen();
		else this.fUebungService.UebungWaehlen(this.fDbModule.StammUebungsListe, aSession as Session, this.SelectUebungDelegate);
	}

	public PasteExcercise(aSession: ISession) {
		if (this.fGlobalService.SessUebungKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
		mSessUebung.SessionID = aSession.ID;
		aSession.UebungsListe.push(mSessUebung);
	}

	public toggleSessions(): void {
		if (!this.accSession) return;

		if (this.isExpanded) {
			this.accSession.forEach((acc) => acc.closeAll());
			this.isExpanded = false;
			this.ToggleButtonText = "Open all Sessions";
		} else {
			this.accSession.forEach((acc) => acc.openAll());
			this.isExpanded = true;
			this.ToggleButtonText = "Close all Sessions";
		}
	}

	public accCheckSessionPanels() {
		if (!this.panUebung) return;

		let mAllClosed = true;

		const mPanUebungListe = this.panUebung.toArray();
		for (let index = 0; index < mPanUebungListe.length; index++) {
			if (mPanUebungListe[index].expanded) {
				mAllClosed = false;
				break;
			}
		}

		if (mAllClosed) {
			this.isExpanded = false;
			this.ToggleButtonText = "Open all sessions";
		} else {
			this.isExpanded = true;
			this.ToggleButtonText = "Close all sessions";
		}
	}

	public AddSession() {
		const mDate = new Date();
		const mSession: Session = new Session();
		mSession.Name = `Session ${mDate.toLocaleString()}`;
		mSession.Datum = new Date();
		mSession.DauerInSek = 0;
		mSession.SessionNr = this.SessionListe.length + 1;
		mSession.Kategorie01 = SessionStatus.Bearbeitbar;
		//mSession.FK_Programm = this.programm.ID;
		this.SessionListe.push(mSession);
	}

	public PasteSession() {
		if (this.fGlobalService.SessionKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSession: ISessionDB = this.fGlobalService.SessionKopie.Copy();
		//mSession.FK_Programm = this.programmID;
		this.SessionListe.push(mSession as Session);
	}

	public startSession(aEvent: Event, aSession: ISession) {
		aEvent.stopPropagation();

		if (aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.FertigTimeOut) return;

		switch (aSession.Kategorie02) {
			case SessionStatus.Wartet:
				aSession.GestartedWann = new Date();
				aSession.Kategorie02 = SessionStatus.Laueft;
				break;

			case SessionStatus.Pause:
				aSession.StarteDauerTimer();
				break;
			// case SessionStatus.Laueft: aSession.StartePauseTimer(); break;
		}

		// aSession.GestartedWann = new Date();
		// const navigationExtras: NavigationExtras = {
		//     state: {
		//       sess: aSession
		//     }
		//   };
		this.router.navigate(["sessionFormComponent"], { state: { sess: aSession,  nextSessionNr : this.SessionListe.length + 1 } });
	}

	public SaveChanges() {
		this.ClickData.fDbModule.ProgrammSpeichern(this.ClickData.programm);
        if (this.ClickData.ProgrammSavedEvent !== undefined)
            this.ClickData.ProgrammSavedEvent.emit(this.ClickData.programm);
	}

	public CancelChanges() {}

	private CheckStatus() {
		for (let index = 0; index < this.SessionListe.length; index++) {
			this.StartButtonText(this.SessionListe[index]);
		}
	}

	ngDoCheck() {
		// this.CheckStatus();
		this.accCheckSessionPanels();
	}
}
