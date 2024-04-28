import { ISession, Session } from './../../../Business/Session/Session';
import { ProgramCopyPara, SessionCopyPara, UebungParaDB, onDeleteFn } from './../../services/dexie-svc.service';
import { DexieSvcService, ProgrammParaDB } from 'src/app/services/dexie-svc.service';
import { Router } from '@angular/router';
import { ITrainingsProgramm, ProgrammKategorie, TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData, cLoadingDefaultHeight } from 'src/app/dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';
import { Location } from "@angular/common";
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { UebungService } from 'src/app/services/uebung.service';
import { GlobalService } from 'src/app/services/global.service';
import { Uebung, UebungsKategorie02 } from 'src/Business/Uebung/Uebung';
import { UebungWaehlenData } from 'src/app/uebung-waehlen/uebung-waehlen.component';
import { ISessionDB, SessionStatus } from 'src/Business/SessionDB';


@Component({
    selector: "app-workout-form",
    templateUrl: "./workout-form.component.html",
    styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent implements OnInit, IProgramModul  {
    public programm: ITrainingsProgramm;
    public cmpProgramm: ITrainingsProgramm;
    public ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein; 
	@ViewChildren("accSession") accSession: QueryList<MatAccordion>;
	@ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;
	
	private CmpSessionListe: Array<ISession> = [];
	public isExpanded: Boolean = true;    
    ToggleButtonText: string;
    IsExpandedFn: any;
    private DelSessionListe: Array<ISession> = [];

    constructor(
        private router: Router,
        private fDialogService: DialogeService,
        private fDbModule: DexieSvcService,
        private location: Location,
        private fLoadingDialog: DialogeService,
        private fUebungService: UebungService,
        private fGlobalService: GlobalService


    ) {
        const mNavigation = this.router.getCurrentNavigation()!;
        const mState = mNavigation.extras.state as { programm: ITrainingsProgramm };
        this.programm = mState.programm;
        this.fDbModule.CheckSessions(this.programm);
        this.cmpProgramm = mState.programm.Copy(new ProgramCopyPara());
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }

    public AddExercise(aSession: ISession) {
		if (DexieSvcService.StammUebungsListe.length === 0) this.fDbModule.LadeStammUebungen();
		else this.fUebungService.UebungWaehlen(aSession as Session, this.SelectUebungDelegate);
	}

    drop(event: any) {
		//const mEvent = event as CdkDragDrop<ISession[]>;
		if (DexieSvcService.CalcPosAfterDragAndDrop(this.programm.SessionListe, event) === true) {
			this.programm.NummeriereSessions();
			this.SaveChanges();
		}
    }

    public AddSession() {
		const mDate = new Date();
		const mSession: ISession = new Session();
		mSession.Name = `Session ${mDate.toLocaleString()}`;
		mSession.Datum = new Date();
		mSession.DauerInSek = 0;
		mSession.SessionNr = this.programm.SessionListe.length + 1;
		mSession.Kategorie01 = SessionStatus.Bearbeitbar;
		mSession.ListenIndex = this.programm.SessionListe.length;
		mSession.FK_Programm = this.programm.id;
		this.programm.SessionListe.push(mSession);
	}
    
	public SaveChanges():void {
		//this.ClickData.programm.SessionListe;// = this.SessionListe;
		this.DelSessionListe.forEach((s) => 
			this.fDbModule.DeleteSession(s as Session)
		);

		this.DelSessionListe = [];
			
        // const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
		// mProgrammExtraParaDB.OnAfterSaveFn = (aProgram: TrainingsProgramm) => { 
		// 	if (this.ProgrammSavedEvent !== undefined)
		// 		this.ProgrammSavedEvent.emit(aProgram);
		// };

		this.fDbModule.ProgrammSpeichern(this.programm);
    }
    
    public PasteSession() {
		if (DexieSvcService.SessionCopy  === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No session data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.Komplett = true;
		mSessionCopyPara.CopySessionID = false;
		mSessionCopyPara.CopyUebungID = false;
		mSessionCopyPara.CopySatzID = false;
		const mSessionDB: ISessionDB = Session.StaticCopy(DexieSvcService.SessionCopy,mSessionCopyPara);
		//mSession.FK_Programm = this.programmID;
		this.programm.SessionListe.push(mSessionDB as Session);

		if (DexieSvcService.ModulTyp === ProgramModulTyp.SelectWorkout) 
			this.fDbModule.SessionSpeichern(new Session(mSessionDB));
	}


	CopySession(aSession: ISession) {
		const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.CopySatzID = false;
		mSessionCopyPara.CopySessionID = false;
		mSessionCopyPara.CopyUebungID = false;
		DexieSvcService.SessionCopy = Session.StaticCopy(aSession, mSessionCopyPara);
	}

	public PasteExcercise(aSession: ISession) {
		if (this.fGlobalService.SessUebungKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("Nothing to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
		mSessUebung.SessionID = aSession.ID;
		aSession.addUebung(mSessUebung);
    }

    private DeleteSessionPrim(aSession: ISession, aRowNum: number, aOnDelete: onDeleteFn ) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete session #${aRowNum} "${aSession.Name}" ?`);
		mDialogData.OkFn = () => aOnDelete();
		this.fDialogService.JaNein(mDialogData);
    }
    
    DoSessionName(aSess:ISession, aEvent: any) {
		aSess.Name = aEvent.target.value;
		this.fDbModule.SessionSpeichern(aSess as Session);
	}
    
    
	public DeleteSession(aEvent: any, aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(
			aSession,
			aRowNum,
			() => {
				const index: number = this.programm.SessionListe.indexOf(aSession);
				if (index !== -1) 
					this.programm.SessionListe.splice(index, 1);
				
				for (let index = 0; index < this.programm.SessionListe.length; index++) 
					this.programm.SessionListe[index].ListenIndex = index;
				
				this.fDbModule.DeleteSession(aSession as Session);
			}
		);
	}


	private SelectUebungDelegate(aUebungWaehlenData: UebungWaehlenData) {
		aUebungWaehlenData.fUebungsListe.forEach((mUebung) => {
			if (mUebung.Selected) {
				aUebungWaehlenData.fSession.addUebung(
					Uebung.StaticKopiere(
						this.fDbModule,
						mUebung,
						UebungsKategorie02.Session));
			}
		});
		aUebungWaehlenData.fMatDialog.close();
	}
    
	public get SortedSessionListe(): Array<Session> {
		let mResult: Array<Session> = [];
		if (this.ModulTyp === ProgramModulTyp.History) mResult = this.programm.SessionListe as Array<Session>;
		else mResult = this.fDbModule.SortSessionByListenIndex(this.programm.SessionListe as Array<Session>) as Array<Session>;
		return mResult;
    }
	
    private async LadeUebungen(aSess: ISession): Promise<void>  {
		const mDialogData = new DialogData();
		mDialogData.height = cLoadingDefaultHeight;
        mDialogData.ShowAbbruch = false;
        mDialogData.ShowOk = false;
        mDialogData.textZeilen.push('Loading exercises');
		this.fLoadingDialog.Loading(mDialogData);
		try {

			const mUebungPara: UebungParaDB = new UebungParaDB();
			mUebungPara.WhereClause = 'SessionID';
			mUebungPara.anyOf = () => { 
				return aSess.ID;
			};

			// mUebungPara.SaetzeBeachten = true;

			this.fDbModule.LadeSessionUebungenEx(aSess, mUebungPara)
				.then((aUebungsliste) => {
					if (aUebungsliste.length > 0) {
						aSess.UebungsListe = aUebungsliste;
					}
					this.fLoadingDialog.fDialog.closeAll();
				});
		} catch(err) {
			this.fLoadingDialog.fDialog.closeAll();
		}
	}
		

	panelOpened(aSess: ISession) {
		aSess.Expanded = true;

		if (DexieSvcService.ModulTyp === ProgramModulTyp.CreateWorkout)
			return;

		if (aSess.UebungsListe === undefined || aSess.UebungsListe.length <= 0) {
			this.LadeUebungen(aSess);
		}
	}

	panelClosed(aSess: ISession) {
		aSess.Expanded = false;
    }
    
	public toggleSessions(): void {
		if (!this.accSession) return;

		if (this.isExpanded) {
			this.accSession.forEach((acc) => acc.closeAll());
			this.isExpanded = false;
			this.ToggleButtonText = "Open all sessions";
		} else {
			this.accSession.forEach((acc) => acc.openAll());
			this.isExpanded = true;
			this.ToggleButtonText = "Close all Sessions";
		}
		this.IsExpandedFn.emit(this.isExpanded);
	}
    
    CopyProgramm(aProgramm: ITrainingsProgramm) {
        const mProgramCopyPara: ProgramCopyPara = new ProgramCopyPara();
        this.cmpProgramm = aProgramm.Copy(mProgramCopyPara);    
        if  (DexieSvcService.VerfuegbareProgramme.find((aSuchProgram) => { return aSuchProgram === aProgramm; }) === undefined) {
            DexieSvcService.VerfuegbareProgramme.push(aProgramm);
            // TrainingsProgramm.SortByName(DexieSvcService.VerfuegbareProgramme);
        }
    }

    SessionAreExpanded: Boolean = false;

    IsExpanded(aIsExpanded: Boolean) {
        this.SessionAreExpanded = aIsExpanded;
    }

    ngOnInit() { 
        this.ModulTyp = DexieSvcService.ModulTyp;
    }

    get MediaWidth(): number{
        return window.innerWidth;
    }
    
    public back() {
		if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
		
            mDialogData.OkFn = () => {
                this.SaveChangesPrim(() => { this.leave(); });
			}
	
            mDialogData.CancelFn = (): void => {
				if (this.programm.ProgrammKategorie === ProgrammKategorie.Vorlage) {
					const mIndex = DexieSvcService.VerfuegbareProgramme.findIndex((p) => p.id === this.programm.id);
					if (mIndex > -1) {
						DexieSvcService.VerfuegbareProgramme[mIndex] = this.cmpProgramm;
					}
				}

				this.leave();
			};
	
			this.fDialogService.JaNein(mDialogData);
		}
    }
    
    SaveChangesPrim(aOkFn: any) {
        const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
        mProgrammExtraParaDB.OnAfterSaveFn = (aProgram: TrainingsProgramm) => {
            this.CopyProgramm(aProgram)
            aOkFn();
        };
        return this.fDbModule.ProgrammSpeichern(this.programm, mProgrammExtraParaDB);
    }

    CancelChanges() {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            this.programm.resetProgram(this.programm);
            this.leave();
        };

        this.fDialogService.JaNein(mDialogData);
    }

    private doneLeave: boolean = false;
    leave() {
        //if (TrainingsProgramm.StaticIsEqual(this.programm,this.cmpProgramm) === true) {
        if (this.doneLeave === false) {
            this.doneLeave = true;
            this.location.back();
        }
        //} else {
           // this.CancelChanges();
        //}//
    }
}


