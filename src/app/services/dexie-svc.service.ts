import { Hantelscheibe } from 'src/Business/Hantelscheibe/Hantelscheibe';
import { Hantel, HantelTyp } from './../../Business/Hantel/Hantel';
import { Equipment, EquipmentOrigin, EquipmentTyp } from './../../Business/Equipment/Equipment';
import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { Session, ISession } from 'src/Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from './dialoge.service';
import { ISatz, Satz } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { Injectable, NgModule, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, StandardUebungListe , UebungsKategorie02, StandardUebung } from "../../Business/Uebung/Uebung";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { MuscleGroup, MuscleGroupKategorie01, MuscleGroupKategorie02, StandardMuscleGroup } from '../../Business/MuscleGroup/MuscleGroup';
import { GewichtMinus, GewichtPlus } from 'src/Business/GewichtsAenderung/GewichtsAenderung';

export enum ErstellStatus {
    VomAnwenderErstellt,
    AutomatischErstellt,
    Geloescht
}

export interface AktuellesProgramFn {
    (): void;
}

export interface LadeProgrammeFn {
    (aProgramme: Array<TrainingsProgramm>): void;
}

export interface BeforeLoadFn {
    (aData?: any): void;
}

export interface AfterLoadFn {
    (aData?: any): void;
}

export interface NoRecordFn {
    (aData?: any): void;
}

export interface onErrorFn {
    (aData?: any): void;
}



export class LadePara {
    Data?: any;
    fProgrammTyp?: ProgrammTyp;
    fProgrammKategorie?: ProgrammKategorie; 
    OnProgrammBeforeLoadFn?: BeforeLoadFn; 
    OnProgrammAfterLoadFn?: AfterLoadFn; 
    OnProgrammNoRecordFn?: NoRecordFn; 
    OnSessionBeforeLoadFn?: BeforeLoadFn;
    OnSessionAfterLoadFn?: AfterLoadFn; 
    OnSessionNoRecordFn?: NoRecordFn; 
    OnUebungBeforeLoadFn?: BeforeLoadFn;
    OnUebungAfterLoadFn?: AfterLoadFn; 
    OnUebungNoRecordFn?: NoRecordFn; 
    OnSatzBeforeLoadFn?: BeforeLoadFn;
    OnSatzAfterLoadFn?: AfterLoadFn; 
    OnSatzNoRecordFn?: NoRecordFn; 
}    

@Injectable({
    providedIn: "root",
})
    
@NgModule({
    providers: [DexieSvcService],
})

    
export class DexieSvcService extends Dexie {
    readonly cUebung: string = "Uebung";
    readonly cSatz: string = "Satz";
    readonly cProgramm: string = "Programm";
    readonly cAppData: string = "AppData";
    readonly cSession: string = "SessionDB";
    readonly cMuskelGruppe : string = "MuskelGruppe";
    readonly cEquipment : string = "Equipment";
    readonly cHantel: string = "Hantel";
    readonly cHantelscheibe : string = "Hantelscheibe";
    readonly cGewichtPlus: string = "GewichtPlus";
    readonly cGewichtMin: string = "GewichtMin";
    
    AktuellerProgrammTyp: ProgrammTyp;
    AktuellesProgramm: ITrainingsProgramm; 
    VorlageProgramme: Array<TrainingsProgramm> = []; 
    AppRec: IAppData;
    AppDataTable: Dexie.Table<AppData, number>;
    UebungTable: Dexie.Table<Uebung, number>;
    SatzTable: Dexie.Table<Satz, number>;
    ProgrammTable: Dexie.Table<ITrainingsProgramm, number>;
    SessionTable: Dexie.Table<Session, number>;
    MuskelGruppeTable: Dexie.Table<MuscleGroup, number>;
    HantelTable: Dexie.Table<Hantel, number>;
    HantelscheibenTable: Dexie.Table<Hantelscheibe, number>;
    GewichtPlusTable: Dexie.Table<GewichtPlus, number>;
    GewichtMinusTable: Dexie.Table<GewichtMinus, number>;
    EquipmentTable: Dexie.Table<Equipment, number>;
    public Programme: Array<ITrainingsProgramm> = [];
    public StammUebungsListe: Array<Uebung> = [];
    public MuskelGruppenListe: Array<MuscleGroup> = [];
    public EquipmentListe: Array<Equipment> = [];
    public LangHantelListe: Array<Hantel> = [];
    public HantelscheibenListe: Array<Hantelscheibe> = []; 

    private ProgramLadeStandardPara: LadePara;

    public get HantenscheibeListeSortedByDiameterAndWeight(): Array<Hantelscheibe> {
        let mResult: Array<Hantelscheibe> = this.HantelscheibenListe.map(mScheibe => mScheibe);

        mResult.sort((hs1: Hantelscheibe, hs2: Hantelscheibe) => {
            const d1: number = Number(hs1.Durchmesser);
            const g1: number = Number(hs1.Gewicht);
            const d2: number = Number(hs2.Durchmesser);
            const g2: number = Number(hs2.Gewicht);
             
            if (d1 > d2)
                return 1;
        
            if (d1 < d2)
                return -1;
            
            if (g1 > g2)
                return 1;
            
            if (g1 < g2)
                return -1;
                 
            return 0;
                
        });
        return mResult;
    }
    

    public LanghantelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<Hantel>{
        let mResult: Array<Hantel> = this.LangHantelListe.map(mHantel => mHantel);

        if (aIgnorGeloeschte) {
            mResult = mResult.filter(h => h.HantelStatus !== ErstellStatus.Geloescht);
        }
        

        mResult.sort((u1, u2) => {
            if (u1.Name > u2.Name) {
                return 1;
            }
        
            if (u1.Name < u2.Name) {
                return -1;
            }
        
            return 0;
        });
        return mResult;
    }
    
    public get EquipmentTypListe(): Array<string>{
        const mResult: Array<string> = [];
        for (const mEquipmentTyp in EquipmentTyp) {
            if (mEquipmentTyp === EquipmentTyp.Unbestimmt)
                continue;
            
            mResult.push(mEquipmentTyp);
        }
        
        return mResult;
    }

    public get EquipmentTypListeSorted(): Array<string> { 
        const mResult: Array<string> = this.EquipmentTypListe.map( mEquipmentTyp => mEquipmentTyp );
        mResult.sort((u1, u2) => {
            if (u1 > u2) {
                return 1;
            }
        
            if (u1 < u2) {
                return -1;
            }
        
            return 0;
        });

        return mResult;        
    }

    
    
    //public ProgrammListeObserver: Observable<TrainingsProgramm[]>;
    //public ProgrammListe: Array<TrainingsProgramm> = [];

    constructor(
        private fDialogeService: DialogeService,
        @Optional() @SkipSelf() parentModule?: DexieSvcService) {
        super("ConceptCoach");
        if (parentModule) {
            throw new Error(
                "DexieSvcService is already loaded. Import it in the AppModule only"
            );
        }

        this.ProgramLadeStandardPara  =
        {
            fProgrammKategorie: ProgrammKategorie.Vorlage,
            fProgramme: this.VorlageProgramme,
    
            OnProgrammBeforeLoadFn: (aData) => {
                this.VorlageProgramme = [];
            },
    
            OnProgrammAfterLoadFn: (p: TrainingsProgramm) => {
                this.VorlageProgramme.push(p);   
            }, //
    
            OnProgrammNoRecordFn: (aPara) => {
                const mProgramme: Array<TrainingsProgramm> = (aPara.Data as Array<TrainingsProgramm>);
                const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
                const mProg: TrainingsProgramm = (mProgramme.find(
                    (p) => p.ProgrammTyp === ProgrammTyp.Gzclp
                ));
        
                if (mProg === undefined)
                    mAnlegen.push(ProgrammTyp.Gzclp);
                else {
                    if (mProgramme.find((p) => p.ProgrammTyp === ProgrammTyp.Gzclp) === undefined) {
                        // Standard-Programm gefunden
                        mProgramme.push(mProg);
                    }
                }
        
                for (let index = 0; index < mAnlegen.length; index++)
                    this.ErzeugeVorlageProgramm(mAnlegen[index]);
            } //OnProgrammNoRecorderLoadFn
        } as LadePara
        
        //   Dexie.delete("ConceptCoach");
        
        this.version(24).stores({
            AppData: "++id",
            Uebung: "++ID,Name,Typ,Kategorie02,FkMuskel01,FkMuskel02,FkMuskel03,FkMuskel04,FkMuskel05",
            Programm: "++id,Name", 
            SessionDB: "++ID,Name,Datum",
            Satz: "++ID",
            MuskelGruppe: "++ID,Name,MuscleGroupKategorie01",
            Equipment: "++ID,Name",
            Hantel: "++ID,Typ,Name",
            Hantelscheibe: "++ID,&[Durchmesser+Gewicht]",
            GewichtPlus: "++ID,&Name",
            GewichtMinus: "++ID,&Name",
        });

        
        this.InitAll();
        //  this.HantelTable.clear();
        this.PruefeStandardLanghanteln();
        this.PruefeStandardEquipment();
        this.PruefeStandardMuskelGruppen();
        this.LadeStammUebungen();
    }

    get UebungListeSortedByName(): Array<Uebung>{
        const mResult: Array<Uebung> = this.StammUebungsListe.map( mUebung => mUebung );
        mResult.sort((u1, u2) => {
            if (u1.Name > u2.Name) {
                return 1;
            }
        
            if (u1.Name < u2.Name) {
                return -1;
            }
        
            return 0;
        });

        return mResult;
    }

    
    MuskelgruppeListeSortedByName(): Array<MuscleGroup>{
        const mResult: Array<MuscleGroup> = this.MuskelGruppenListe.map(mMuskelgruppe => mMuskelgruppe);
        
        mResult.sort((u1, u2) => {
            if (u1.Name > u2.Name) {
                return 1;
            }
        
            if (u1.Name < u2.Name) {
                return -1;
            }
        
            return 0;
        });

        return mResult;
    }

    get EquipmentListSortedByDisplayName(): Array<Equipment>{
        const mResult: Array<Equipment> = this.EquipmentListe.map( mEquipment => mEquipment );
        mResult.sort((u1, u2) => {
            if (u1.DisplayName > u2.DisplayName) {
                return 1;
            }
        
            if (u1.DisplayName < u2.DisplayName) {
                return -1;
            }
        
            return 0;
        });

        return mResult;
    }


    private InitAll() {
        this.InitAppData();
        // this.InitGewichtPlus();
        // this.InitGewichtMinus();
        this.InitHantel();
        this.InitHantelscheibe()
        this.InitEquipment();
        this.InitUebung();
        this.InitProgramm();
        this.InitSession();
        this.InitMuskelGruppe();
        this.InitSatz();
    }

    private InitHantel() {
        this.HantelTable = this.table(this.cHantel);
        this.HantelTable.mapToClass(Hantel);
    }
    
    private InitGewichtPlus() {
        this.GewichtPlusTable = this.table(this.cGewichtPlus);
        this.GewichtPlusTable.mapToClass(GewichtPlus);
    }

    private InitGewichtMinus() {
        this.GewichtMinusTable = this.table(this.cGewichtMin);
        this.GewichtMinusTable.mapToClass(GewichtMinus);
    }

    private InitHantelscheibe() {
        this.HantelscheibenTable = this.table(this.cHantelscheibe);
        this.HantelscheibenTable.mapToClass(Hantelscheibe);
    }  

    private InitMuskelGruppe() {
        this.MuskelGruppeTable = this.table(this.cMuskelGruppe);
        this.MuskelGruppeTable.mapToClass(MuscleGroup);
    }    

    private InitEquipment() {
        this.EquipmentTable = this.table(this.cEquipment);
        this.EquipmentTable.mapToClass(Equipment);
    }

    private InitSession() {
        this.SessionTable = this.table(this.cSession);
        this.SessionTable.mapToClass(Session);
    }

    private InitUebung() {
        this.UebungTable = this.table(this.cUebung);
        this.UebungTable.mapToClass(Uebung);
    }

    private InitSatz() {
        this.SatzTable = this.table(this.cSatz);
        this.SatzTable.mapToClass(Satz);
    }

    private NeueUebung(
        aName: string,
        aKategorie02: UebungsKategorie02,
        aTyp: UebungsTyp
    ): Uebung {
        const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
        const mKategorieen01 = [].concat(mGzclpKategorieen01);
        return Uebung.StaticNeueUebung(
            aName,
            aTyp,
            mKategorieen01,
            aKategorie02
        );
    }

    private NeueMuskelgruppe(
        aName: string,
        aKategorie01: MuscleGroupKategorie01
    ): MuscleGroup {
        return MuscleGroup.StaticNeueMuskelGruppe(aName, aKategorie01);
    }

    public FindMuskel(aMuskel: MuscleGroup): boolean{
        return (this.MuskelExists(aMuskel) !== undefined)
    }

    public MuskelExists(aMuskel: MuscleGroup): MuscleGroup{
        if (aMuskel.Name.trim() === '')
            return undefined;
        
        return this.MuskelGruppenListe.find(mg => mg.Name.toUpperCase() === aMuskel.Name.toUpperCase());
    }


    public MuskelgruppeSpeichern(aMuskelgruppe: MuscleGroup) {
        return this.MuskelGruppeTable.put(aMuskelgruppe);
    }

    public HantelSpeichern(aHantel: Hantel) {
        return this.HantelTable.put(aHantel);
    }

    public InsertHanteln(aHantelListe: Array<Hantel>):PromiseExtended {
        return this.HantelTable.bulkPut(aHantelListe);
    }

    public GewichtPlusSpeichern(aGewichtPlus: GewichtPlus) {
        return this.GewichtPlusTable.put(aGewichtPlus);
    }

    public InsertGewichtPlusListe(aGewichtPlusListe: Array<GewichtPlus>):PromiseExtended {
        return this.GewichtPlusTable.bulkPut(aGewichtPlusListe);
    }

    public LadeGewichtPlus(aAfterLoadFn?: AfterLoadFn) {
        this.table(this.cGewichtPlus)
            .toArray()
            .then((mGewichtPlusListe) => {
                // this.HantelscheibenListe = mGewichtPlusListe;
                if (aAfterLoadFn !== undefined)
                    aAfterLoadFn(mGewichtPlusListe);
            });
    }    

    public GewichtMinusSpeichern(aGewichtMinus: GewichtMinus) {
        return this.GewichtMinusTable.put(aGewichtMinus);
    }

    public InsertGewichtMinusListe(aGewichtMinusListe: Array<GewichtMinus>):PromiseExtended {
        return this.GewichtMinusTable.bulkPut(aGewichtMinusListe);
    }

    public LadeGewichtMinus(aAfterLoadFn?: AfterLoadFn) {
        this.table(this.cGewichtMin)
            .toArray()
            .then((mGewichtMinusListe) => {
                this.HantelscheibenListe = mGewichtMinusListe;
                if (aAfterLoadFn !== undefined)
                    aAfterLoadFn(mGewichtMinusListe);
            });
    }

    public InsertUebungen(aUebungsListe: Array<Uebung>): PromiseExtended {
        return this.UebungTable.bulkPut(aUebungsListe);
    }

    public InsertMuskelGruppen(aMuskelGruppenListe: Array<MuscleGroup>): PromiseExtended {
        return this.MuskelGruppeTable.bulkPut(aMuskelGruppenListe);
    }

    public FindUebung(aUebung: Uebung): boolean{
        return (this.UebungExists(aUebung) !== undefined)
    }

    public UebungExists(aUebung: Uebung): Uebung{
        if (aUebung.Name.trim() === '')
            return undefined;
        
        return this.StammUebungsListe.find(ub => ub.Name.toUpperCase() === aUebung.Name.toUpperCase());
    }

    public HantelscheibeSpeichern(aScheibe: Hantelscheibe) {
        return this.HantelscheibenTable.put(aScheibe);
    }

    public InsertHantelscheiben(aHantelscheibenListe: Array<Hantelscheibe>): PromiseExtended {
        return this.HantelscheibenTable.bulkPut(aHantelscheibenListe);
    }

    public LadeHantelscheiben(aAfterLoadFn?: AfterLoadFn) {
        this.table(this.cHantelscheibe)
            .toArray()
            .then((mHantelscheibenListe) => {
                this.HantelscheibenListe = mHantelscheibenListe;
                if (aAfterLoadFn !== undefined)
                    aAfterLoadFn(mHantelscheibenListe);
            });
    }

    public LadeMuskelGruppen(aAfterLoadFn?: AfterLoadFn) {
        this.MuskelGruppenListe = [];
        this.table(this.cMuskelGruppe)
            .toArray()
            .then((mMuskelgruppenListe) => {
                this.MuskelGruppenListe = mMuskelgruppenListe;
                
                if (aAfterLoadFn !== undefined)
                    aAfterLoadFn();
            });
    }

    public MuskelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<MuscleGroup>{
        let mResult: Array<MuscleGroup> = this.MuskelGruppenListe.map(mMuskel => mMuskel);

        if (aIgnorGeloeschte) {
            mResult = mResult.filter(h => h.Status !== ErstellStatus.Geloescht);
        }
        

        mResult.sort((u1, u2) => {
            if (u1.Name > u2.Name) {
                return 1;
            }
        
            if (u1.Name < u2.Name) {
                return -1;
            }
        
            return 0;
        });
        return mResult;
    }    


    public async PruefeStandardMuskelGruppen() {

        const mAnlegen: Array<MuscleGroup> = new Array<MuscleGroup>();
        await this.table(this.cMuskelGruppe)
            .where("MuscleGroupKategorie01").equals(MuscleGroupKategorie01.Stamm as number)
            .toArray()
            .then((mMuskelgruppenListe) => {
                for (let index = 0; index < StandardMuscleGroup.length; index++) {
                    const mStandardMuscleGroup: MuscleGroupKategorie02 = StandardMuscleGroup[index];
                    if (
                        mMuskelgruppenListe.find((mMuskelgruppe: MuscleGroup) => mMuskelgruppe.Name === mStandardMuscleGroup) === undefined
                    ) {
                        const mNeueMuskelgruppe = this.NeueMuskelgruppe(
                            mStandardMuscleGroup,
                            MuscleGroupKategorie01.Stamm
                        );
                        mAnlegen.push(mNeueMuskelgruppe);
                    }
                }

                if (mAnlegen.length > 0) {
                    this.InsertMuskelGruppen(mAnlegen).then(() => {
                        this.PruefeStandardMuskelGruppen();
                    });
                } else this.LadeMuskelGruppen();
            });
    }

    public LadeLanghanteln(aAfterLoadFn?: AfterLoadFn) {
        this.LangHantelListe = [];
        this.table(this.cHantel)
            .filter(
                (mHantel: Hantel) => (mHantel.Typ === HantelTyp.Barbell)
            )
            .toArray()
            .then((mHantelListe) => {
                this.LangHantelListe = mHantelListe;

                if (aAfterLoadFn !== undefined)
                    aAfterLoadFn();
            });
    }

    private PruefeStandardLanghanteln() {
        const mAnlegen: Array<Hantel> = new Array<Hantel>();
        this.table(this.cHantel)
            .filter(
                (mHantel: Hantel) => ((mHantel.Typ === HantelTyp.Barbell) &&((mHantel.Durchmesser === 50)||(mHantel.Durchmesser === 30)||(mHantel.Durchmesser === 25))) 
            )
            .toArray()
            .then((mHantelListe) => {
                const mDurchmesser: number[]  = [50, 30, 25];
                for (const mTyp in HantelTyp) {
                    if (mTyp === HantelTyp.Dumbbel)
                        continue;

                    for (let index = 0; index < mDurchmesser.length; index++) {
                        let mHantel = mHantelListe.find((h: Hantel) => (h.Typ === mTyp && (h.Durchmesser === mDurchmesser[index])));
                        if (mHantel === undefined) {
                            const mNeueHantel = Hantel.StaticNeueHantel(
                                mTyp + ' - ' + mDurchmesser[index],
                                HantelTyp[mTyp],
                                mDurchmesser[index],
                                ErstellStatus.AutomatischErstellt
                            );
                        
                            mAnlegen.push(mNeueHantel);
                        }
                    }
                }

                if (mAnlegen.length > 0)
                    this.InsertHanteln(mAnlegen).then(() => this.PruefeStandardLanghanteln());
                else
                    this.LadeLanghanteln();
            });
    }


    public InsertEquipment(aEquipmentListe: Array<Equipment>): PromiseExtended {
        return this.EquipmentTable.bulkPut(aEquipmentListe);
    }

    public LadeEquipment() {
        this.EquipmentListe = [];
        this.table(this.cEquipment)
            .toArray()
            .then((mEquipmentListe) => {
                    this.EquipmentListe = mEquipmentListe;
            });
    }

    public PruefeStandardEquipment() {
        const mAnlegen: Array<Equipment> = new Array<Equipment>();
        this.table(this.cEquipment)
            .filter(
                (mEquipment:Equipment ) => mEquipment.EquipmentOrigin === EquipmentOrigin.Standard
            )
            .toArray()
            .then((mEquipmentListe) => {
                for (const mEquipmentTyp in EquipmentTyp) {
                    if (mEquipmentTyp === EquipmentTyp.Unbestimmt)
                        continue;
                    
                    if (
                        mEquipmentListe.find((mEquipment:Equipment) => mEquipment.EquipmentTyp === mEquipmentTyp) === undefined) {
                        const mNeuesEquipment = Equipment.StaticNeuesEquipment(
                            mEquipmentTyp,
                            EquipmentOrigin.Standard,
                            EquipmentTyp[mEquipmentTyp]
                        );
                        mAnlegen.push(mNeuesEquipment);
                    }
                }

                if (mAnlegen.length > 0) {
                    this.InsertEquipment(mAnlegen).then(() => {
                        this.PruefeStandardEquipment();
                    });
                }
                else this.LadeEquipment();
            });
    }

    public LadeStammUebungen() {
        this.StammUebungsListe = [];
        const mAnlegen: Array<Uebung> = new Array<Uebung>();
        this.table(this.cUebung)
            .where("Kategorie02").equals(UebungsKategorie02.Stamm as number)
            .toArray()
            .then((mUebungen) => {
                let mNeueUebung: Uebung = null;
                for (let index = 0; index < StandardUebungListe.length; index++) {
                    const mStandardUebung = StandardUebungListe[index];
                    if (mUebungen.find((mUebung) => mUebung.Name === mStandardUebung.Name) === undefined)
                    {
                        mNeueUebung = this.NeueUebung(
                            mStandardUebung.Name,
                            UebungsKategorie02.Stamm,
                            mStandardUebung.Typ
                        );
                        mNeueUebung.SatzListe = [];
                        mAnlegen.push(mNeueUebung);
                    }
                }

                if (mAnlegen.length > 0) {
                    this.InsertUebungen(mAnlegen).then(() => {
                        this.LadeStammUebungen();
                    });
                } else {
                    // Standard-Uebungen sind vorhanden.
                    this.StammUebungsListe = mUebungen;
                    // Standard-Vorlage-Programme laden
                    this.LadeProgramme(this.ProgramLadeStandardPara);
                    // Aktuelles Programm laden
                    this.LadeProgramme(
                        {
                            fProgrammKategorie: ProgrammKategorie.AktuellesProgramm,

                            OnProgrammAfterLoadFn: (mProgramm: TrainingsProgramm) => {
                                this.AktuellesProgramm = mProgramm;
                                this.PrepAkuellesProgramm(this.AktuellesProgramm)
                            }, // OnProgrammAfterLoadFn
                                
                        } as LadePara
                    ); // Aktuelles Programm laden
                }
            });
    }

    public PrepAkuellesProgramm(aProgramm: ITrainingsProgramm) {
        let mNeueSessions: Array<SessionDB> = [];
        let mUndoneSessions: Array<SessionDB> = [];
        let mDoneSessions: Array<SessionDB> = [];

        const mVorlageProgramm = this.VorlageProgramme.find((p) => {
            if (p.ProgrammTyp === aProgramm.ProgrammTyp)
                return p;
            return null;
        });
         
                
        for (let i = 0; i < aProgramm.SessionListe.length; i++) {
             if ((aProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig)
              || (aProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut))
                 mDoneSessions.push(aProgramm.SessionListe[i]);
        }      

        //         // Sind alle Sessions des aktuellen Programms erledigt?  
        //         if (mDoneSessions.length === this.fDbModule.AktuellesProgramm.SessionListe.length) {
        //             // Alle Sessions des aktuellen Programms sind erledigt  
        //             if (this.fDbModule.AktuellesProgramm.SessionListe.length < this.fDbModule.AktuellesProgramm.Tage * 2) {
        //                 for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
        //                     this.fDbModule.AktuellesProgramm.SessionListe[i].init();
        //                 }
        //             }
        //         }
                    
        //         this.fDbModule.AktuellesProgramm.SessionListe = [];
        //         for (let i = 0; i < mUndoneSessions.length; i++)
        //             this.fDbModule.AktuellesProgramm.SessionListe.push(mUndoneSessions[i] as ISession);

        //         if (this.fDbModule.AktuellesProgramm.SessionListe.length <  this.fDbModule.AktuellesProgramm.Tage * 2) {
        //             for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
        //                 let mSessionDB: SessionDB = null;
        //                 // if ((this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.Fertig)
        //                 //     || (this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.FertigTimeOut)) {
        //                 mSessionDB = this.fDbModule.AktuellesProgramm.SessionListe[i].Copy();
        //                 mSessionDB.Kategorie02 = SessionStatus.Wartet;
        //                 mNeueSessions.push(mSessionDB);
        //             }
                
                
        //             for (let i = 0; i < mNeueSessions.length; i++) {
        //                 this.fDbModule.AktuellesProgramm.SessionListe.push(mNeueSessions[i] as ISession);
                    
        //             }
    }

    public getBodyWeight(): number{
        return 105;
    }

    public SucheUebungPerName(aName: string): Uebung {
        const mUebung = this.StammUebungsListe.find((u) => u.Name === aName);
        return mUebung === undefined ? null : mUebung;
    }

    private InitProgramm() {
        this.ProgrammTable = this.table(this.cProgramm);
        this.ProgrammTable.mapToClass(TrainingsProgramm);
    }

    public LadeProgrammSessions(aProgramm: TrainingsProgramm, aLadePara?: LadePara): void {
        if ((aLadePara !== undefined) && (aLadePara.OnSessionBeforeLoadFn !== undefined)) 
            aLadePara.OnSessionBeforeLoadFn(aLadePara);        
        
        this.table(this.cSession)
            .filter((s) => s.FK_Programm === aProgramm.id)
            .toArray()
            .then(
                (aSessions: Array<Session>) => {
                    if (aSessions.length > 0) {
                        aProgramm.SessionListe = aSessions;
                        aProgramm.SessionListe.forEach((s) => (this.LadeSessionUebungen(s, aLadePara)));

                        if ((aLadePara !== undefined) && (aLadePara.OnSessionAfterLoadFn !== undefined))
                            aLadePara.OnSessionAfterLoadFn(aLadePara);
                    }
                    else if ((aLadePara !== undefined) && (aLadePara.OnSessionNoRecordFn !== undefined))
                        aLadePara.OnSessionNoRecordFn(aLadePara);
                });
    }

    public LadeSessionUebungen(aSession: ISession, aLadePara?: LadePara): void {
        if ((aLadePara !== undefined) && (aLadePara.OnUebungBeforeLoadFn !== undefined)) 
            aLadePara.OnUebungBeforeLoadFn(aLadePara);        

        this.table(this.cUebung)
            .filter((mUebung) => mUebung.SessionID === aSession.ID)
            .toArray()
            .then(
                (aUebungen: Array<Uebung>) => {
                    if (aUebungen.length > 0) {
                        aSession.UebungsListe = aUebungen;
                        aSession.UebungsListe.forEach((u: Uebung) => {
                            // Session-Übungen sind keine Stamm-Übungen.
                            // Ist der Schlüssel zur Stamm-Übung gesetzt?  
                            if (u.FkUebung > 0) {
                            //Der Schlüssel zur Stamm-Übung ist gesetzt  
                            const mStammUebung = this.StammUebungsListe.find(mGefundeneUebung => mGefundeneUebung.ID === u.FkUebung);
                                if (mStammUebung !== undefined)
                                    u.Name = mStammUebung.Name;
                            } else {
                            // Der Schlüssel zur Stamm-Übung sollte normalewiese gesetzt?  
                            const mStammUebung = this.StammUebungsListe.find(mGefundeneUebung => mGefundeneUebung.Name === u.Name);
                                if (mStammUebung !== undefined)
                                    u.FkUebung = mStammUebung.ID;
                                this.UebungSpeichern(u);
                            }

                            this.LadeUebungsSaetze(u, aLadePara);
                            if ((aLadePara !== undefined) && (aLadePara.OnUebungAfterLoadFn !== undefined))
                                aLadePara.OnUebungAfterLoadFn(aLadePara);
                        });
                    } else if ((aLadePara !== undefined) && (aLadePara.OnUebungNoRecordFn !== undefined))
                        aLadePara.OnUebungNoRecordFn(aLadePara);
                }
            )
    }

    public LadeUebungsSaetze(aUebung: Uebung, aLadePara?: LadePara) {
        if ((aLadePara !== undefined) && (aLadePara.OnSatzBeforeLoadFn !== undefined)) 
            aLadePara.OnSatzBeforeLoadFn(aLadePara);        

        this.table(this.cSatz)
            .filter(
                (mSatz) =>
                    mSatz.UebungID === aUebung.ID &&
                    mSatz.SessionID === aUebung.SessionID
            )
            .toArray()
            .then(
                (aSaetze: Array<Satz>) => {
                    if (aSaetze.length > 0) {
                        aUebung.SatzListe = aSaetze;
                        aUebung.SatzListe.forEach((s) => {
                            if ((aLadePara !== undefined) && (aLadePara.OnSatzAfterLoadFn !== undefined))
                                aLadePara.OnSatzAfterLoadFn(aLadePara);
                        
                        })
                    } else if ((aLadePara !== undefined) && (aLadePara.OnSatzNoRecordFn !== undefined))
                        aLadePara.OnSatzNoRecordFn(aLadePara);
                }
            )
    }

    private DoAktuellesProgramm(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm): void {
        if (aAltesAktuellesProgramm) {
            aAltesAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.Fertig;
            this.ProgrammSpeichern(aAltesAktuellesProgramm);
        }
        const mNeu = aNeuesAktuellesProgramm.ErstelleSessionsAusVorlage(ProgrammKategorie.AktuellesProgramm);
        this.ProgrammSpeichern(mNeu);
        this.AktuellesProgramm = mNeu;
    }

    public CheckAktuellesProgram(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm ):void {
        // Soll das aktuelle Programm durch ein anderes ersetzt werden?
        if (aAltesAktuellesProgramm !== undefined) {
            const mDialogData = new DialogData();
            mDialogData.OkData = aNeuesAktuellesProgramm;
            mDialogData.OkFn = (): void => {
                // Es gibt ein aktuelles Programm, aber der Anwender will es ersetzen. 
                this.DoAktuellesProgramm(aNeuesAktuellesProgramm, aAltesAktuellesProgramm);
            };

            // Sind altes und neues Programm gleich?
            if (aNeuesAktuellesProgramm.Name === aAltesAktuellesProgramm.Name) {
                // Altes und neues Programm sind gleich
                mDialogData.textZeilen.push(`This program is already active!`);
                mDialogData.textZeilen.push(`Select it anyway?`);
            } else {
                // Das aktuelle Work-Out soll durch ein anderes ersetzt werden.
                mDialogData.textZeilen.push(
                    `Replace current Program "${aAltesAktuellesProgramm.Name}" with "${aNeuesAktuellesProgramm.Name}" ?`
                );
            }
    
            this.fDialogeService.JaNein(mDialogData);
        } else {
            // Es gibt kein aktuelles Work-Out.
            this.DoAktuellesProgramm(aNeuesAktuellesProgramm);
        }
    }

    public FindVorlageProgramm(aProgramme: Array<TrainingsProgramm>, aProgrammTyp: ProgrammTyp): Boolean{
        return aProgramme.find((p) => {
            if (p.ProgrammTyp === aProgrammTyp)
                return p;
            return null;
        }) != null;
    }

//    public LadeAktuellesProgramm(aProgramme: Array<TrainingsProgramm>, aNeuesAktuellesProgram?: ITrainingsProgramm): TrainingsProgramm {
    //     // Gibt es schon ein aktuelles Programm?
    //     if (aProgramme.length > 0) {
    //         this.FuelleProgramm(aProgramme[0]);
    //         // Es gibt schon ein aktuelles Programm.
    //         // Soll ein anderes aktuelles Programm gewaehlt werden?
    //         if (aNeuesAktuellesProgram !== undefined)
    //             // Es soll ein anderes aktuelles Programm gewaehlt werden.
    //             this.CheckAktuellesProgram(aNeuesAktuellesProgram, aProgramme[0]);
    //         else
    //              // Es soll kein anderes aktuelles Programm gewaehlt werden.
    //             return aProgramme[0];
    //     } else {
    //         // Es gibt kein aktuelles Programm.
    //         // Soll ein aktuelles Programm gewaehlt werden?
    //         if (aNeuesAktuellesProgram !== undefined)
    //              // Es soll ein aktuelles Programm gewaehlt werden
    //              this.CheckAktuellesProgram(aNeuesAktuellesProgram);
    //     }
    //     return null;
    // }

    public LadeAktuellesProgramm(aAktuellesProgramm: ITrainingsProgramm): void { 
            // this.LadeProgramme(ProgrammKategorie.AktuellesProgramm,
            //     (mProgramm) => {
            //         if ((mProgramm !== undefined) && (mProgramm !== null)) {
            //             let mNeueSessions: Array<SessionDB> = [];
            //             let mUnDoneSessions: Array<SessionDB> = [];
            //             let mDoneSessions: Array<SessionDB> = [];
            //             // Das gefundene aktuelle Programm kopieren.
            //             this.AktuellesProgramm = mProgramm.Copy();

            //             // Die fertigen und nicht fertigen Sessions merken
            //             for (let i = 0; i < mProgramm.SessionListe.length; i++) {
            //                 if ((mProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig)
            //                     || (mProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut))
            //                     // fertige Session
            //                     mDoneSessions.push(mProgramm.SessionListe[i]);
            //                 else 
            //                     // Nicht fertige Session
            //                     mUnDoneSessions.push(mProgramm.SessionListe[i]);
            //             }      

                        // Sind alle Sessions des aktuellen Programms erledigt?  
                        // if (mDoneSessions.length === this.fDbModule.AktuellesProgramm.SessionListe.length) {
                        //     // Alle Sessions des aktuellen Programms sind erledigt  
                        //     if (this.fDbModule.AktuellesProgramm.SessionListe.length < this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //         for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //             this.fDbModule.AktuellesProgramm.SessionListe[i].init();
                        //         }
                        //     }
                        // }
                            
                        // this.fDbModule.AktuellesProgramm.SessionListe = [];
                        // for (let i = 0; i < mUnDoneSessions.length; i++)
                        //     this.fDbModule.AktuellesProgramm.SessionListe.push(mUnDoneSessions[i] as ISession);

                        // if (this.fDbModule.AktuellesProgramm.SessionListe.length <  this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //     for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //         let mSessionDB: SessionDB = null;
                        //         // if ((this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.Fertig)
                        //         //     || (this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.FertigTimeOut)) {
                        //         mSessionDB = this.fDbModule.AktuellesProgramm.SessionListe[i].Copy();
                        //         mSessionDB.Kategorie02 = SessionStatus.Wartet;
                        //         mNeueSessions.push(mSessionDB);
                        //     }
                        
                        
                        //     for (let i = 0; i < mNeueSessions.length; i++) {
                        //         this.fDbModule.AktuellesProgramm.SessionListe.push(mNeueSessions[i] as ISession);
                            
                        //     }
                        // }
                    
                    // }
                // });
    }


    public LadeProgramme(aLadePara: LadePara): void {
        if ((aLadePara !== undefined) && (aLadePara.OnProgrammBeforeLoadFn !== undefined)) 
            aLadePara.OnProgrammBeforeLoadFn(aLadePara);

        this.table(this.cProgramm)
            .filter(
                (a) => a.ProgrammKategorie === aLadePara.fProgrammKategorie.toString()
            )
            .toArray()
            .then(
                (aProgramme: Array<TrainingsProgramm>) => {
                    if (aProgramme.length > 0) {
                        aProgramme.forEach((p: TrainingsProgramm) => {
                            if (p.Zyklen === undefined)
                                p.Zyklen = 1;
                            
                            if(p.SessionListe === undefined)
                                p.SessionListe = new Array<Session>();
                            
                            this.LadeProgrammSessions(p, aLadePara);

                            if ((aLadePara !== undefined) && (aLadePara.OnProgrammAfterLoadFn !== undefined)) {
                                aLadePara.OnProgrammAfterLoadFn(p);
                            }
                        });
                    } else if ((aLadePara !== undefined) && (aLadePara.OnProgrammNoRecordFn !== undefined)) {
                        aLadePara.Data = aProgramme;
                        aLadePara.OnProgrammNoRecordFn(aLadePara);
                    }
                }
            )
            .catch((error) => {
                console.error(error);
            });
    }

    // private FuelleProgramm(aProgramm: ITrainingsProgramm, aCylcleCount: number = 1): void {
    //     const mDoneSessionListe = new Array<Session>();
    //     for (let index = 0; index < aCylcleCount; index++) {
    //         this.LadeProgrammSessions(aProgramm, (mSessions: Array<ISession>) => {
    //             if (mSessions === undefined)
    //                 return;
                    
    //             if (aProgramm.SessionListe === undefined)
    //                 aProgramm.SessionListe = new Array<Session>();
            
    //             mSessions.forEach((s: Session) => {
    //                 if (aProgramm.SessionListe !== undefined) {
    //                     const mCopiedSession = s.Copy();
    //                     aProgramm.SessionListe.push(mCopiedSession as Session);
    //                     // Fertige Session in Extra-Liste kopieren
    //                     if ((s.Kategorie02 === SessionStatus.Fertig)
    //                         || (s.Kategorie02 === SessionStatus.FertigTimeOut))
    //                         mDoneSessionListe.push(mCopiedSession as Session);
                    
    //                 }
    //             });
            
    //             mDoneSessionListe.forEach(
    //                 (mDoneSession: Session) => {
    //                     const mFindSession: ISession = aProgramm.SessionListe.find((s, mIndex) => {
    //                         if (s.ID === mDoneSession.ID)
    //                             return s;
    //                         return null;
    //                     })

    //                     if (mFindSession !== null) {
                        
    //                     }
    //                 }
    //             );
        
                    
    //             for (let j = 0; j < aProgramm.SessionListe.length; j++) {
    //                 // Session
    //                 const mSession: ISession = aProgramm.SessionListe[j];

    //                 if (mSession.Kategorie02 === undefined)
    //                     mSession.Kategorie02 = SessionStatus.Wartet;
            
    //                 if (mSession.BodyWeightAtSessionStart === undefined)
    //                     mSession.BodyWeightAtSessionStart = 0;
            
    //                 this.LadeSessionUebungen(mSession)
    //                     .then(
    //                         u => mSession.UebungsListe = u
    //                     );
                        
    //                 for (let z = 0; z < mSession.UebungsListe.length; z++) {
    //                     // Uebung
    //                     const mUebung = mSession.UebungsListe[z];
                
    //                     if (mUebung.WarmUpVisible === undefined)
    //                         mUebung.WarmUpVisible = true;

    //                     if (mUebung.CooldownVisible === undefined)
    //                         mUebung.CooldownVisible = true;

    //                     if (mUebung.IncludeWarmupWeight === undefined)
    //                         mUebung.IncludeWarmupWeight = false;

    //                     if (mUebung.IncludeCoolDownWeight === undefined)
    //                         mUebung.IncludeCoolDownWeight = false;
                
    //                     if (mUebung.Expanded === undefined)
    //                         mUebung.Expanded = false;
                
    //                     this.LadeUebungsSaetze(mUebung)
    //                         .then(
    //                             (s) => mUebung.SatzListe = s
    //                         );

    //                     mUebung.SatzListe.forEach(mSatz => {
    //                         if (mSatz.IncludeBodyweight === undefined)
    //                             mSatz.IncludeBodyweight = false;
                    
    //                         if (mSatz.BodyWeight === undefined)
    //                             mSatz.BodyWeight = 0;
    //                     })
    //                 }

    //             }
    //         });
    //     }
    // }

    public SatzSpeichern(aSatz: ISatz) {
        return this.SatzTable.put(aSatz as Satz);
    }

    public SaetzeSpeichern(aSaetze: Array<ISatz>) {
        return this.SatzTable.bulkPut(aSaetze as Array<Satz>);
    }

    public UebungSpeichern(aUebung: Uebung) {
        return this.transaction("rw", this.UebungTable, this.SatzTable, () => {
            this.UebungTable.put(aUebung)
                .then((mUebungID: number) => {
                // Uebung ist gespeichert.
                // UebungsID in Saetze eintragen.
                aUebung.ID = mUebungID;
                aUebung.SatzListe.forEach((mSatz) => {
                    mSatz.UebungID = mUebungID;
                    mSatz.SessionID = aUebung.SessionID;
                });
                this.SaetzeSpeichern(aUebung.SatzListe);
            });
        });
    }

    public SessionSpeichern(aSession: Session) {
        return this.transaction(
            "rw",
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                this.SessionTable.put(aSession).then(
                    // Session ist gespeichert
                    // SessionID in Uebungen eintragen
                    (mSessionID:number) => {
                        aSession.UebungsListe.forEach((mUebung) => {
                            mUebung.SessionID = mSessionID;
                            this.UebungSpeichern(mUebung);
                        });
                    }
                )
            }
        ).catch(r => (
            console.log(r)
        ));
    }
    

    public ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm ) {
        return this.transaction(
            "rw",
            this.ProgrammTable,
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                // const mSessions = mTrainingsProgramm.SessionListe;
                // aTrainingsProgramm.SessionListe = [];
                // const mOrgDbModule: DBModule = aTrainingsProgramm.pDbModule;
                // aTrainingsProgramm.pDbModule = null;
                this.ProgrammTable.put(aTrainingsProgramm)
                    .then(
                        // Programm ist gespeichert.
                        // ProgrammID in die Sessions eintragen
                        (id) => {
                            aTrainingsProgramm.SessionListe.forEach(
                                (mEineSession) => {
                                    mEineSession.FK_Programm = id;
                                    this.SessionSpeichern(mEineSession as Session);
                                }
                            );
                        }
                    )
                    .catch((err) => {
                        console.error(err);
                    });
            }
        );
    }

    public async ErzeugeVorlageProgramm(aProgrammTyp: ProgrammTyp) {
        let mTrainingsProgramm: ITrainingsProgramm = null;

        if (aProgrammTyp === ProgrammTyp.Gzclp) {
            mTrainingsProgramm = GzclpProgramm.ErzeugeGzclpVorlage(this);
        }

        await this.ProgrammSpeichern(mTrainingsProgramm);
        this.LadeProgramme(this.ProgramLadeStandardPara);
    }

    private async InitAppData() {
        this.AppDataTable = this.table(this.cAppData);
        this.AppDataTable.mapToClass(AppData);
        await this.AppDataTable.limit(1).first(
            (aAppRec) => (this.AppRec = aAppRec)
        );

        if (!this.AppRec) {
            this.AppRec = new AppData();
            await this.AppDataTable.put(this.AppRec).catch((error) => {
                console.error(error);
            });
        }
    }
}