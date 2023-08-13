import { DexieSvcService, SatzParaDB } from './../../services/dexie-svc.service';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Uebung, SaetzeStatus } from './../../../Business/Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { ISession, Session } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, Output, EventEmitter, ChangeDetectionStrategy  } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
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
    @Input() cmpSettingsSession: ISession;
    @Input() SessUeb: Uebung;
    @Input() rowNum: number = 0;
    @Input() bearbeitbar: Boolean = true;
    @Input() panUebung1: MatExpansionPanel;
    @Input() ShowStats: Boolean = false;
    @Input() StatsVisible: Boolean = false;
    @Input() DeletedSatzList: Array<Satz> = [];
    @Input() SofortSpeichern: Boolean = false;
    @Input() programmTyp: string = "";
    @Input() StatsButtonVisible: boolean = false;
    
    @Output() DoStats = new EventEmitter<any>();
    @Output() DoCheckSettings = new EventEmitter<ExerciseSettingSvcService>();
    @Output() AddDeletedExercise = new EventEmitter<Uebung>();

    
    @ViewChildren("accUebung") accUebung: QueryList<MatAccordion>;
    @ViewChildren("panUebung") panUebung: QueryList<MatExpansionPanel>;
    @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
    @ViewChild("Info") Info: any;
    
    private fExerciseOverlayConfig: ExerciseOverlayConfig;
    private fExerciseSettingsComponent: ExerciseSettingsComponent;
    public checkingSets: boolean = false;
    private worker: Worker;
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

    DoWorker() {
        const that = this;
        if (typeof Worker !== 'undefined') {
            if (that.session.UebungsListe !== undefined) {
                that.worker = new Worker(new URL('./programm03.worker', import.meta.url));
                that.UebungsListe.forEach((mUebung) => {
                    if (mUebung.SatzListe.length === 0)
                        that.CheckUebungSatzliste(mUebung);
                });
            }//if
            that.worker.postMessage('LadeSaetze');
        }//if
    }
            
    ngAfterViewInit() {
        // this.DoWorker();

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
            setTimeout(() => {
                this.DoStatsFn()
            }, (500));
        }
    }

    public DoStatsFn() {
        if (this.DoStats !== undefined)
            this.DoStats.emit(this.Info);
    }

    public DoCheckSettingsFn() {
        if (this.DoCheckSettings !== undefined)
            this.DoCheckSettings.emit(this.fExerciseSettingSvcService);
    }

    drop(event: any) {
        const mEvent = event as CdkDragDrop<Uebung[]>;
        this.session.UebungsListe[event.previousIndex].ListenIndex = mEvent.currentIndex;
        this.session.UebungsListe[event.currentIndex].ListenIndex = mEvent.previousIndex;
    }
    
    public get UebungsListe(): Array<Uebung>{
        return Uebung.StaticUebungsListeSortByListenIndex(this.session.UebungsListe);
    }

    getArbeitsSaetzeStatus(aSessUeb: Uebung): SaetzeStatus{
        return Uebung.StaticAlleSaetzeStatus(aSessUeb);
    }

    ngOnDestroy() {
        // if (this.fExerciseSettingsComponent !== undefined)
        //     this.fExerciseSettingsComponent.close();
        
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

    async PanelUebungOpened(aMatExpansionPanelIndex: number, aUebung: Uebung) {
        try {
            this.checkingSets = true;

            if (aUebung !== undefined)
                aUebung.Expanded = true;
    
                
            if (this.panUebung === undefined)
                return;
                
            const mPanUebungListe = this.panUebung.toArray();
            if ((mPanUebungListe[aMatExpansionPanelIndex].expanded === true)&&(aUebung.SatzListe.length === 0)) 
                this.CheckUebungSatzliste(aUebung);
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


    private async LadeUebungsSaetze(aUebung: Uebung, aSatzParaDB?: SatzParaDB) : Promise<Array<Satz>> {
        return await this.fDbModule.LadeUebungsSaetze(aUebung.ID, aSatzParaDB)
            .then( async (aSatzliste) => {
                if (aSatzliste.length > 0) {
                    // aUebung.SatzListe = aSatzliste;
                    aSatzliste.forEach((aSatz) => {
                        if (aUebung.SatzListe.find((aCmpSatz) => aSatz.ID === aCmpSatz.ID) === undefined)
                            aUebung.SatzListe.push(aSatz);
                    });
                    return aUebung.SatzListe;
                    // return await this.LadeUebungsSaetze(aUebung, mSatzParaDB);
                }
                return [];
            });
    }

    private async CheckUebungSatzliste(aUebung: Uebung): Promise<Uebung> {
        if (aUebung.SatzListe === undefined || aUebung.SatzListe.length <= 0) {
            aUebung.SatzListe = [];
            await this.LadeUebungsSaetze(aUebung);
        }
        return aUebung;
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
                if (aUebung.ID > 0) 
                    this.AddDeletedExercise.emit(aUebung);
                
                // SessUeb aus Liste entfernen.
                this.session.UebungsListe.splice(index, 1);
                Session.nummeriereUebungsListe(this.session.UebungsListe);
            }

            if (this.fGlobalService.Comp03PanelUebungObserver != null) {
                this.panUebung1.expanded = false;
                // of(this.panUebung1).subscribe(
                //     this.fGlobalService.Comp03PanelUebungObserver
                // );
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

        // const mCmpUebung: Uebung = this.cmpSettingsSession.UebungsListe.find((mUebung) => {
        //     if (mUebung.ID === aSessUeb.ID || mUebung.ListenIndex === aSessUeb.ListenIndex && mUebung.FkUebung === aSessUeb.FkUebung)
        //         return mUebung;
        //     return undefined;
        // });

        const mCmpUebung: Uebung = this.session.UebungsListe.find((mUebung) => {
            if (mUebung.ID === aSessUeb.ID || mUebung.ListenIndex === aSessUeb.ListenIndex && mUebung.FkUebung === aSessUeb.FkUebung)
                return mUebung;
            return undefined;
        });


        this.fExerciseOverlayConfig = {
            hasBackdrop: true,
            panelClass: 'cc-overlay',
            uebung: aSessUeb,
            cmpUebungSettings: mCmpUebung,
            programm: this.programm,
            session: this.session,
            left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
            top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
            sofortSpeichern: this.SofortSpeichern

        } as ExerciseOverlayConfig;
        
            
        this.fExerciseSettingsComponent = this.fExerciseSettingSvcService.open(this.fExerciseOverlayConfig);
        this.DoCheckSettingsFn();
    }
    
}

// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker(new URL('./programm03.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }