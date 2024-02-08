import { DexieSvcService, SessionParaDB, UebungParaDB, onDeleteFn } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { DialogeService } from '../services/dialoge.service';
import { DialogData, cLoadingDefaultHeight } from '../dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from '../app.module';
import { ISessionStatus, SessionStatus } from 'src/Business/SessionDB';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ISatzStatus, SatzStatus } from 'src/Business/Satz/Satz';

@Component({
	selector: 'app-anstehende-sessions',
	templateUrl: './anstehende-sessions.component.html',
	styleUrls: ['./anstehende-sessions.component.scss'],
})
export class AnstehendeSessionsComponent implements OnInit, IProgramModul,  ISatzStatus, ISessionStatus  {
	public isCollapsed = false;
	private worker: Worker;
	// private fProgramm: ITrainingsProgramm;

	constructor(
		private fDbModule: DexieSvcService,
		private fDialogService: DialogeService,
		private fLoadingDialog: DialogeService,
		private router: Router
	) { }
	
	get sessionStatus(): typeof SessionStatus {
		return SessionStatus;
	}
    
    get satzStatus(): typeof SatzStatus {
		return SatzStatus;
	}

	drop(event: any) {
		const mEvent = event as CdkDragDrop<Session[]>;
		this.SortedSessionListe[event.previousIndex].ListenIndex = mEvent.currentIndex;
		this.SortedSessionListe[event.currentIndex].ListenIndex = mEvent.previousIndex;
		this.fDbModule.SessionSpeichern(this.SortedSessionListe[mEvent.previousIndex] as Session);
		this.fDbModule.SessionSpeichern(this.SortedSessionListe[mEvent.currentIndex] as Session);
	}

	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}

	DoSessionName(aSess: Session, aEvent: any) {
		aSess.Name = aEvent.target.value;
		this.fDbModule.SessionSpeichern(aSess as Session);
	}

	private async LadeSessions(aOffSet: number = 0): Promise<void> {
		const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = false;
		mDialogData.hasBackDrop = false;
		mDialogData.height = '150px';
		this.fLoadingDialog.Loading(mDialogData);
		try {
			const mSessionParaDB: SessionParaDB = new SessionParaDB();
			mSessionParaDB.UebungenBeachten = true;
			mSessionParaDB.UebungParaDB = new UebungParaDB();
			mSessionParaDB.UebungParaDB.WhereClause = 'SessionID';
			mSessionParaDB.UebungParaDB.anyOf = (aSession) => {
				return aSession.ID;
			};

			mSessionParaDB.UebungParaDB.SaetzeBeachten = true;
		} catch (err) {
			this.fLoadingDialog.fDialog.closeAll();
			console.error(err);
		}
	}

	ngOnInit() {
		DexieSvcService.ModulTyp = ProgramModulTyp.AnstehendeSessions;
	}

	public get AktuellesProgramm(): ITrainingsProgramm {
		return DexieSvcService.AktuellesProgramm;
	}

	beforePanelOpened(aSess: Session) {
		aSess.Expanded = true;
	}

	beforePanelClosed(aSess: Session) {
		aSess.Expanded = false;
	}

	get SessionListe(): Array<Session> {
		return this.AktuellesProgramm.SessionListe;
	}

	ResetSession(aEvent: Event,aSess: Session) {
		aEvent.stopPropagation();
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Reset Session?`);
		mDialogData.OkFn = () => { 
			aSess.Reset();
			this.fDbModule.SessionSpeichern(aSess);
		};
		this.fDialogService.JaNein(mDialogData);
	}

	panelOpened(aSess: Session) {}

	panelClosed(aSess: Session) {}

    startSession(aEvent: Event, aSess: Session) {
        aEvent.stopPropagation();
		const mDialogData = new DialogData();
		mDialogData.height = cLoadingDefaultHeight;
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = false;

		mDialogData.textZeilen.push('Preparing session');
		const mLadePara: UebungParaDB = new UebungParaDB();
		mLadePara.SaetzeBeachten = true;
		this.router.navigate(['sessionFormComponent'], {
			state: {
				programm: DexieSvcService.AktuellesProgramm,
				sess: aSess,
				ModulTyp: ProgramModulTyp.RunningSession,
			},
		});
	}

	public StartButtonText(aSess: Session): string {
		if (aSess.Kategorie02 === undefined) aSess.Kategorie02 = SessionStatus.Wartet;

		switch (aSess.Kategorie02) {
			case SessionStatus.Wartet:
				return 'Start';
			case SessionStatus.Laueft:
			case SessionStatus.Pause:
				return 'Go ahead';
			case SessionStatus.Fertig:
			case SessionStatus.FertigTimeOut:
				return 'View';
			default:
				return '?';
		}
	}

	private DeleteSessionPrim(aSession: Session, aRowNum: number, aOnDelete: onDeleteFn) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete session #${aRowNum} "${aSession.Name}" ?`);
		mDialogData.OkFn = () => aOnDelete();
		this.fDialogService.JaNein(mDialogData);
	}

	public DeleteSession(aEvent: any, aSession: Session, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(aSession, aRowNum, () => {
			const index: number = this.SessionListe.indexOf(aSession);
			if (index !== -1) this.SessionListe.splice(index, 1);

			for (let index = 0; index < this.SessionListe.length; index++) this.SessionListe[index].ListenIndex = index;

			this.fDbModule.DeleteSession(aSession as Session);
		});
	}

    get SortedSessionListe(): Array<Session> {
        return (this.AktuellesProgramm.SessionListe).sort((s1, s2) => {
			if (s1.ListenIndex > s2.ListenIndex) return 1;
            if (s1.ListenIndex < s2.ListenIndex) return -1;
            return 0;
		}) ;
	}

	get GewichtsEinheit(): string {
		return DexieSvcService.GewichtsEinheitText;
	}

	DoWorker() {
		const that: AnstehendeSessionsComponent = this;
		if (typeof Worker !== 'undefined') {
			if (DexieSvcService.AktuellesProgramm === undefined || this.fDbModule.RefreshAktuellesProgramm === true) {
				this.fDbModule.RefreshAktuellesProgramm = false;
				that.worker = new Worker(new URL('./anstehende-sessions.worker', import.meta.url));
				that.worker.addEventListener('message', ({ data }) => {
					if (data.action === 'LadeAktuellesProgramm') {
						that.fDbModule.LadeAktuellesProgramm().then(async (aProgramm) => {
							DexieSvcService.AktuellesProgramm = aProgramm;
							DexieSvcService.CmpAktuellesProgramm = aProgramm;
							// this.fProgramm = aProgramm;
							if (aProgramm !== undefined) {
								DexieSvcService.AktuellesProgramm.SessionListe = [];
								// this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
								that.LadeSessions();
							}
						});
					} // if
					else if (data.action === 'LadeUebungen') {
						// that.Programm.SessionListe = that.fDbModule.AktuellesProgramm.SessionListe;
						const mUebungParaDB: UebungParaDB = new UebungParaDB();
						// mUebungParaDB.SaetzeBeachten = true;
						DexieSvcService.AktuellesProgramm.SessionListe.forEach(
							// that.fDbModule.AktuellesProgramm.SessionListe.forEach(
							(aSession) => {
								if (aSession.UebungsListe === undefined || aSession.UebungsListe.length <= 0) {
									that.fDbModule
										.LadeSessionUebungen(aSession.ID, mUebungParaDB)
										.then((aUebungsListe) => {
											if (aUebungsListe.length > 0) aSession.UebungsListe = aUebungsListe;
										});
								}
							}
						); //for
						// that.fDbModule.AktuellesProgramm.SessionListe = this.fProgramm.SessionListe;
					} //if
				});
			} else {
				//    this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
				// this.fProgramm = this.fDbModule.AktuellesProgramm;
			}

			// that.worker.onmessage = ({ data }) => {
			//     console.log(data);
			// };
			that.worker.postMessage('LadeAktuellesProgramm');
		}
	}
}