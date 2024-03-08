import { EigenesTrainingsProgramm } from './../../Business/EigenesTrainingsProgramm/EigenesTrainingsProgramm';
import { ProgrammKategorie, ProgrammTyp, TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ITrainingsProgramm } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { DexieSvcService, ProgramCopyPara, SessionCopyPara, onDeleteFn } from './../services/dexie-svc.service';
import { Observable, of } from 'rxjs';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { IProgramModul, ProgramModulTyp } from '../app.module';
import { NoAutoCreateItem } from 'src/Business/NoAutoCreate';
import { DialogData, cLoadingDefaultHeight } from '../dialoge/hinweis/hinweis.component';
import { DialogeService } from '../services/dialoge.service';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../bausteine/toolbar/toolbar.component';
import { ISession, Session } from 'src/Business/Session/Session';
import { ISaetzeStatus, SaetzeStatus, Uebung, UebungsKategorie02 } from 'src/Business/Uebung/Uebung';
import { UebungWaehlenData } from '../uebung-waehlen/uebung-waehlen.component';
import { UebungService } from '../services/uebung.service';
import { GlobalService } from '../services/global.service';
import { ISatzTyp, SatzTyp } from 'src/Business/Satz/Satz';
import { MatExpansionPanel } from '@angular/material/expansion';
import { relativeTimeThreshold } from 'moment';

@Component({
    selector: "app-programm-waehlen",
    templateUrl: "./programm-waehlen.component.html",
    styleUrls: ["./programm-waehlen.component.scss"],
})
export class ProgrammWaehlenComponent implements OnInit, IProgramModul, ISatzTyp, ISaetzeStatus  {
    public ProgrammListeObserver: Observable<ITrainingsProgramm[]>;
    ViewInitDone: boolean = false;
    checkingSets: boolean = false;

    @ViewChildren('panUebung') panUebung: QueryList<MatExpansionPanel>;
    
    get ProgrammListe(): Array<ITrainingsProgramm> {
        const p: Array<ITrainingsProgramm> = DexieSvcService.VerfuegbareProgramme;
        return DexieSvcService.VerfuegbareProgramme;
    };

    constructor(
        public fDbModul: DexieSvcService,
        public fDialogService: DialogeService,
        private router: Router,
        private fUebungService: UebungService,
        private fGlobalService: GlobalService
        
    ) {
        DexieSvcService.ModulTyp = ProgramModulTyp.SelectWorkout;
    }
    get saetzeStatus(): typeof SaetzeStatus {
        return SaetzeStatus;
    }
    get satzTyp(): typeof SatzTyp {
        return SatzTyp;
    }
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }

    get GewichtsEinheit(): string {
		return DexieSvcService.GewichtsEinheitText;
	}

    PanelUebungClosed(aUebung: Uebung) {
		if (aUebung !== undefined) aUebung.Expanded = false;

		if (this.panUebung === undefined) return;

		this.accCheckUebungPanels(aUebung);
    }
    
    async PanelUebungOpened(aMatExpansionPanelIndex: number, aUebung: Uebung) {
		try {
			this.checkingSets = true;

			if (aUebung !== undefined) aUebung.Expanded = true;

			if (this.panUebung === undefined) return;

		} finally {
			this.checkingSets = false;
		}
	}
        
    ngOnInit() {
   
    }

    satzTypVisible(aSessUebung: Uebung, aSatzTyp: SatzTyp): boolean{
        switch (aSatzTyp) {
            case SatzTyp.Aufwaermen:
                return (aSessUebung.WarmUpVisible);
            
            case SatzTyp.Abkuehlen:
                return (aSessUebung.CooldownVisible);
            
            default:
                return true;
        }
    }

    async accCheckUebungPanels(aUebung?: Uebung) {
		// if (!this.panUebung) return;

		// let mAllClosed = false;

		// if (this.session.UebungsListe.length > 0 && aUebung !== undefined) {
		// 	const mIndex = this.session.UebungsListe.indexOf(aUebung);
		// 	if (mIndex > -1) {
		// 		const mPanUebungListe = this.panUebung.toArray();
		// 		if (mPanUebungListe.length - 1 >= mIndex) mPanUebungListe[mIndex].expanded = aUebung.Expanded;
		// 	}

		// 	mAllClosed = true;
		// 	this.checkingSets = false;

		// 	const mPanUebungListe = this.panUebung.toArray();
		// 	this.checkingSets = true;
		// 	for (let index = 0; index < mPanUebungListe.length; index++) {
		// 		const mPtrUebung: Uebung = this.session.UebungsListe[index];
		// 		mPtrUebung.Expanded = mPanUebungListe[index].expanded;
		// 		if (mPanUebungListe[index].expanded) {
		// 			mAllClosed = false;
		// 		}

		// 		this.checkingSets = false;
		// 	}
		// }

		// if (mAllClosed) {
		// 	this.isExpanded = false;
		// 	this.ToggleButtonText = 'Open all excercises';
		// } else {
		// 	this.isExpanded = true;
		// 	this.ToggleButtonText = 'Close all excercises';
		// }
	}

    
	// PanelUebungClosed(aUebung: Uebung) {
	// 	if (aUebung !== undefined) aUebung.Expanded = false;

	// 	if (this.panUebung === undefined) return;

	// 	this.accCheckUebungPanels(aUebung);
	// }

    dropUebung(event: any, aSession: Session) {
		if(DexieSvcService.CalcPosAfterDragAndDrop(aSession.UebungsListe, event) === true)
			Session.nummeriereUebungsListe(aSession.UebungsListe);
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
		if (DexieSvcService.StammUebungsListe.length === 0) this.fDbModul.LadeStammUebungen();
		else this.fUebungService.UebungWaehlen(aSession as Session, this.SelectUebungDelegate);
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


    DoSessionName(aSess:ISession, aEvent: any) {
		aSess.Name = aEvent.target.value;
		this.fDbModul.SessionSpeichern(aSess as Session);
	}

    panelSessOpened(aSess: ISession) {
		aSess.Expanded = true;
	}

	panelSessClosed(aSess: ISession) {
		aSess.Expanded = false;
    }

    private DeleteSessionPrim(aSession: ISession, aRowNum: number, aOnDelete: onDeleteFn ) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete session #${aRowNum} "${aSession.Name}" ?`);
		mDialogData.OkFn = () => aOnDelete();
		this.fDialogService.JaNein(mDialogData);
    }
    
    // drop(aProgram: ITrainingsProgramm, event: any) {
	// 	//const mEvent = event as CdkDragDrop<ISession[]>;
	// 	if (DexieSvcService.CalcPosAfterDragAndDrop(this.programm.SessionListe, event) === true) {
	// 		this.programm.NummeriereSessions();
	// 		this.SaveChanges();
	// 	}
	//  }
	
    
    public DeleteSession(aEvent: any, aProgram: ITrainingsProgramm, aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(
			aSession,
			aRowNum,
			() => {
				const index: number = aProgram.SessionListe.indexOf(aSession);
				if (index !== -1) 
                    aProgram.SessionListe.splice(index, 1);
			
                aProgram.NummeriereSessions();
				this.fDbModul.DeleteSession(aSession as Session);
			}
		);
	}

    private SelectWorkout(aSelectedProgram: ITrainingsProgramm) {
        // this.fDbModul.RefreshAktuellesProgramm = true;
        // this.router.navigate(["app-initial-weight"], { state: { Program: aSelectedProgram } });

        const mDialogData = new DialogData();
		mDialogData.height = cLoadingDefaultHeight;
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = false;
		mDialogData.textZeilen.push('Preparing program');
		this.fDialogService.Loading(mDialogData);
		try {
            this.fDbModul.SetAktuellesProgramm(aSelectedProgram as TrainingsProgramm).then(() => {
                ToolbarComponent.StaticNavHome(this.router);
                // mDialogData.textZeilen[0] = 'program is ready to use';
				this.fDialogService.fDialog.closeAll();
			});
		} catch (error) {
			this.fDialogService.fDialog.closeAll();
		}
    }

    SelectThisWorkoutClick(aSelectedProgram: ITrainingsProgramm, $event: any): void {
        this.SelectBtnDisabled = false;
        $event.stopPropagation();
        this.fDbModul.FindAktuellesProgramm()
        .then((p) => {
                if (p.find( (prog) => prog.FkVorlageProgramm === aSelectedProgram.id ) !== undefined ) {
                    const mDialogData = new DialogData();
                    mDialogData.hasBackDrop = true;
                    mDialogData.textZeilen.push("The program is already chosen!");
                    mDialogData.textZeilen.push("Do want to select it anyway?");
                    mDialogData.OkFn = (): void => {
                        p.forEach((pr) =>
                            this.fDbModul.DeleteProgram(pr as TrainingsProgramm)
                        );
                        this.SelectWorkout(aSelectedProgram);
                    }

                    mDialogData.CancelFn = (): void => {
                        this.SelectBtnDisabled = false;
                     }            

                    this.fDialogService.JaNein(mDialogData);
                } else {
                    this.SelectWorkout(aSelectedProgram);
                }
            });
    }
    
    get programPanelHeaderHeight(): string {
        if (window.innerWidth <= 280)
            return '165px';
        return '80px';
    }


    get Toolbar_1_row(): boolean {
		return GlobalService.calcToolbarRrows() === 1;
	}	

	get Toolbar_2_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 2;
	}

	get Toolbar_3_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 3;
	}    


    EditThisWorkoutClick(aProgram: ITrainingsProgramm, $event): void {
        $event.stopPropagation();
        if (DexieSvcService.ModulTyp === ProgramModulTyp.SelectWorkout)
            DexieSvcService.ModulTyp = ProgramModulTyp.SelectWorkoutEdit;
        else
            DexieSvcService.ModulTyp = ProgramModulTyp.EditWorkout;

        this.router.navigate(["/workoutform"], { state: { programm: aProgram } });
    }

    CopyProgramm(aEvent: Event, aProgramm: ITrainingsProgramm){
        aEvent.stopPropagation();
        const mProgramCopyPara: ProgramCopyPara = new ProgramCopyPara();
        mProgramCopyPara.CopyProgramID = false;
        mProgramCopyPara.CopySatzID = false;
        mProgramCopyPara.CopySessionID = false;
        mProgramCopyPara.CopyUebungID = false;
        mProgramCopyPara.CopySatzID = false;
        const aNewWorkOut: ITrainingsProgramm = aProgramm.Copy(mProgramCopyPara);
        aNewWorkOut.Name = `Copy of "${aNewWorkOut.Name}"`; 
        aNewWorkOut.ProgrammTyp = ProgrammTyp.Custom;
        aNewWorkOut.ProgrammKategorie = ProgrammKategorie.Vorlage;
        TrainingsProgramm.createWorkOut(this.fDbModul, aNewWorkOut);
    }

    panelOpened(aProgram: ITrainingsProgramm) {
        aProgram.Expanded = true;
        this.fDbModul.CheckSessions(aProgram);
    }

    panelClosed(aProgram: ITrainingsProgramm) {
        aProgram.Expanded = false;
    }

    SelectBtnDisabled: boolean = false;

    DeleteProgramm(aEvent: Event,aProgramm: ITrainingsProgramm) {
        aEvent.stopPropagation();
        const mDialogData = new DialogData();
        mDialogData.hasBackDrop = true;
        mDialogData.textZeilen.push('Do you really want to delete "'+aProgramm.Name.trim()+ '"!');
        mDialogData.OkFn = (): void => {
            this.fDbModul.DeleteProgram(aProgramm as TrainingsProgramm)

            switch (aProgramm.ProgrammTyp) {
                case ProgrammTyp.Gzclp:
                    this.fDbModul.NoAutoCreateItemSpeichern(NoAutoCreateItem.GzclpProgram);
                    break;
                
                case ProgrammTyp.HypertrophicSpecific:
                    this.fDbModul.NoAutoCreateItemSpeichern(NoAutoCreateItem.HypertrophicSpecificProgram);
                    break;
            }//switch

            const mIndex = DexieSvcService.VerfuegbareProgramme.findIndex((mSuchProgramm) => { return mSuchProgramm === aProgramm; });
            
            if (mIndex > -1)
                DexieSvcService.VerfuegbareProgramme.splice(mIndex, 1);
            
        }

        mDialogData.CancelFn = (): void => {
            this.SelectBtnDisabled = false;
         }            

        this.fDialogService.JaNein(mDialogData); 
    }

    createWorkOut() {
        const mNeuesProgram: ITrainingsProgramm = new EigenesTrainingsProgramm(
            ProgrammTyp.Custom,
            ProgrammKategorie.Vorlage,
            this.fDbModul
        );

        TrainingsProgramm.createWorkOut(this.fDbModul, mNeuesProgram);
    }

    // drop(event: any) {
	// 	const mEvent = event as CdkDragDrop<ISession[]>;
		
	// 	this.ProgrammListe[event.previousIndex].ListenIndex = mEvent.currentIndex;
	// 	this.programm.SessionListe[event.currentIndex].ListenIndex = mEvent.previousIndex;
	// 	this.fDbModule.SessionSpeichern(this.programm.SessionListe[mEvent.previousIndex] as Session);
	// 	this.fDbModule.SessionSpeichern(this.programm.SessionListe[mEvent.currentIndex] as Session);		
	// }

    ngAfterViewInit() {
        this.ViewInitDone = true;        
    }

    public TrainingsProgrammeVorhanden(): Boolean {
        return (this.ProgrammListe.length > 0);
    }
}
