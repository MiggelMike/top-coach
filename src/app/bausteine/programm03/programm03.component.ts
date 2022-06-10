import { cSatzSelectLimit, DexieSvcService, SatzParaDB } from './../../services/dexie-svc.service';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Uebung  } from './../../../Business/Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { ISession } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, Output, EventEmitter, ChangeDetectionStrategy  } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { of } from 'rxjs';
import { LOCALE_ID, Inject } from '@angular/core';
import { floatMask } from 'src/app/app.module';
import { ExerciseSettingsComponent } from 'src/app/exercise-settings/exercise-settings.component';
import { ExerciseOverlayConfig, ExerciseSettingSvcService } from 'src/app/services/exercise-setting-svc.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Satz } from 'src/Business/Satz/Satz';


@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
    
    
export class Programm03Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() session: ISession;
    @Input() cmpSession: ISession;
    @Input() SessUeb: Uebung;
    @Input() rowNum: number = 0;
    @Input() bearbeitbar: Boolean;
    @Input() panUebung1: MatExpansionPanel;
    @Input() ShowStats: Boolean = false;
    @Input() StatsVisible: Boolean = false;
    @Input() DeletedExerciseList: Array<Uebung> = [];
    @Input() DeletedSatzList: Array<Satz> = [];
    @Input() SofortSpeichern: Boolean = false;
    @Input() programmTyp: string = "";
    @Output() DoStats = new EventEmitter();
    @Output() DoPanels = new EventEmitter();
    
    @ViewChildren("accUebung") accUebung: QueryList<MatAccordion>;
    @ViewChildren("panUebung") panUebung: QueryList<MatExpansionPanel>;
    @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
    private fExerciseOverlayConfig: ExerciseOverlayConfig;
    private fExerciseSettingsComponent: ExerciseSettingsComponent;
    public checkingSets: boolean = false;

    public floatMask = floatMask;
    private isExpanded: Boolean = true;
    public ToggleButtonText = "Close all excercises";
    public LocaleID: string;
    // private UebungPanelsObserver = {
    //     next: (x: MatExpansionPanel) => {
    //         this.accCheckUebungPanels(this.SessUeb);
    //     },
    //     error: (err) =>
    //         console.error("UebungPanelsObserver got an error: " + err),
    //     complete: () =>
    //         console.log("UebungPanelsObserver got a complete notification"),
    // };

    ngOnInit() {
    }

    constructor(
        @Inject(LOCALE_ID) localID: string,
        private fGlobalService: GlobalService,
        private fDialogService: DialogeService,
        private fExerciseSettingSvcService: ExerciseSettingSvcService,
        private fDbModule: DexieSvcService
    ) {
        this.LocaleID = localID;
        // if (this.fGlobalService.Comp03PanelUebungObserver === null)
        //     this.fGlobalService.Comp03PanelUebungObserver = this.UebungPanelsObserver;
    }
            
    ngAfterViewInit() {
        if (this.session.UebungsListe !== undefined) {
            // if(this.session.UebungsListe.length <= 0) {
            //     this.fDbModule.LadeSessionUebungen(this.session.ID)
            //         .then((aUebungsListe) => {
            //             this.session.UebungsListe = aUebungsListe;
            //             this.session.UebungsListe.forEach((mUebung: Uebung) => {
            //                 this.accCheckUebungPanels(mUebung);
            //             });
            //         });
            // }

            if (this.session.UebungsListe.length > 0) {
                this.session.UebungsListe.forEach((mUebung: Uebung) => {
                    this.accCheckUebungPanels(mUebung);
                });
            } else {
                this.accCheckUebungPanels();

                // this.accUebung.forEach((acc) => acc.closeAll());
                // this.isExpanded = false;
                // this.ToggleButtonText = "Open all exercises";
                // if(this.SessUeb !== undefined)
                //     this.SessUeb.Expanded = false;
            }
        }
    }

    DoStatsFn() {
        if (this.DoStats !== undefined)
            this.DoStats.emit();
    }

    DoPanelsFn() {
        const x = 0;
    }

    drop(event: CdkDragDrop<Uebung[]>) {
        this.session.UebungsListe[event.previousIndex].ListenIndex = event.currentIndex;
        this.session.UebungsListe[event.currentIndex].ListenIndex = event.previousIndex;
    }
    
    public get UebungsListe(): Array<Uebung>{
        return Uebung.StaticUebungsListeSortByListenIndex(this.session.UebungsListe);
    }

    ngOnDestroy() {
        if (this.fGlobalService.Comp03PanelUebungObserver != null)
            this.fGlobalService.Comp03PanelUebungObserver = null;
        
    }

    async toggleUebungen() {
        if (this.isExpanded)
        {
            this.accUebung.forEach((acc) => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all exercises";
            this.SessUeb.Expanded = false;
        } else {
            this.accUebung.forEach((acc) => acc.openAll());
            // for (let index = 0; index < this.session.UebungsListe.length; index++) {
            //     this.CheckUebungSatzliste(this.session.UebungsListe[index]);
            // }
            this.isExpanded = true;
            this.ToggleButtonText = "Close all exercises";
            if(this.SessUeb !== undefined)
                this.SessUeb.Expanded = true;
        }
    }

    async PanelUebungOpened(aUebung: Uebung) {
        try {
            this.checkingSets = true;

            if (aUebung !== undefined)
                aUebung.Expanded = true;
    
                
            if (this.panUebung === undefined)
                return;
                
                
            this.CheckUebungSatzliste(aUebung);
            // this.accCheckUebungPanels(aUebung);
        } finally {
            this.checkingSets = false;
        }
    }

    PanelUebungClosed(aUebung: Uebung) {
        if(aUebung !== undefined )
            aUebung.Expanded = false;

        if (this.panUebung === undefined)
            return;

            
        this.accCheckUebungPanels(aUebung);
    }

    private async LadeUebungsSaetze(aUebung: Uebung, aSatzParaDB?: SatzParaDB) : Promise<void> {
        await this.fDbModule.LadeUebungsSaetze(aUebung.ID, aSatzParaDB)
            .then( async (aSatzliste) => {
                if (aSatzliste.length > 0) {
                    // aUebung.SatzListe = aSatzliste;
                    aSatzliste.forEach((aSatz) => {
                        if (aUebung.SatzListe.find((aCmpSatz) => aSatz.ID === aCmpSatz.ID) === undefined)
                            aUebung.SatzListe.push(aSatz);
                    });
                    const mSatzParaDB: SatzParaDB = new SatzParaDB();
                    mSatzParaDB.Limit = cSatzSelectLimit;
                    mSatzParaDB.OffSet = aUebung.SatzListe.length;
                    await this.LadeUebungsSaetze(aUebung, mSatzParaDB);
                }
            });
    }

    private async CheckUebungSatzliste(aUebung: Uebung): Promise<any> {
        if (aUebung.SatzListe === undefined || aUebung.SatzListe.length <= 0) {
            aUebung.SatzListe = [];
            const mSatzParaDB: SatzParaDB = new SatzParaDB();
            mSatzParaDB.Limit = cSatzSelectLimit;
            mSatzParaDB.OffSet = 0;
            await this.LadeUebungsSaetze(aUebung, mSatzParaDB);
        }
    }

        
    async accCheckUebungPanels(aUebung?: Uebung) {
        if (!this.panUebung) return;
        
        let mAllClosed = false;

        if (this.session.UebungsListe.length > 0 && aUebung !== undefined) {
            const mIndex = this.session.UebungsListe.indexOf(aUebung);
            if (mIndex > -1) {
                const mPanUebungListe = this.panUebung.toArray();
                if(mPanUebungListe.length-1 >= mIndex)
                    mPanUebungListe[mIndex].expanded = aUebung.Expanded;
            }
        
            mAllClosed = true;
            this.checkingSets = false;
            
            const mPanUebungListe = this.panUebung.toArray();
            this.checkingSets = true;
            for (let index = 0; index < mPanUebungListe.length; index++) {
                const mPtrUebung: Uebung = this.session.UebungsListe[index];
                mPtrUebung.Expanded = mPanUebungListe[index].expanded;
                if (mPanUebungListe[index].expanded) {
                    mAllClosed = false;
                }
                
                this.checkingSets = false;
            }
        }

        if (mAllClosed) {
            this.isExpanded = false;
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }


    public DeleteExercise(aRowNum: number, aUebung: Uebung, aEvent: Event) {
        aEvent.stopPropagation();
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete exercise #${aRowNum} "${aUebung.Name}" ?`);
        mDialogData.OkFn = (): void => {
            // Index der SessUeb in Liste suchen.
            const index: number = this.session.UebungsListe.indexOf(aUebung);

            // SessUeb-Index gefunden?
            if (index !== -1) {
                // SessUeb-Index gefunden
                if (aUebung.ID > 0) {
                    this.DeletedExerciseList.push(aUebung);
                }
                // SessUeb aus Liste entfernen.
                this.session.UebungsListe.splice(index, 1);
            }

            if (this.fGlobalService.Comp03PanelUebungObserver != null) {
                this.panUebung1.expanded = false;
                of(this.panUebung1).subscribe(
                    this.fGlobalService.Comp03PanelUebungObserver
                );
            }
        };

        this.fDialogService.JaNein(mDialogData);
    }

    public CopyExcercise(aUebung: Uebung, aEvent: Event) {
        aEvent.stopPropagation();
        this.fGlobalService.SessUebungKopie = aUebung.Copy();
    }

    public DoSettings(aSessUeb: Uebung, aEvent: Event) {
        aEvent.stopPropagation();

        this.fExerciseOverlayConfig = {
            uebung: aSessUeb,
            programm: this.programm,
            session: this.session,
            left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
            top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
            sofortSpeichern: this.SofortSpeichern

        } as ExerciseOverlayConfig;
        
            
        this.fExerciseSettingsComponent = this.fExerciseSettingSvcService.open(this.fExerciseOverlayConfig);
    }
    
}
