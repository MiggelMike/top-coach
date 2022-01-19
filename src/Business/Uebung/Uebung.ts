import { ProgressGroup } from 'src/Business/Progress/Progress';
import { Zeitraum } from './../Dauer';
import { Equipment } from './../Equipment/Equipment';
import { MuscleGroupKategorie02 } from '../MuscleGroup/MuscleGroup';
import { VorgabeWeightLimit } from '../Progress/Progress';
import { Satz, SatzTyp, LiftTyp, SatzPausen, SatzStatus } from './../Satz/Satz';

var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual')

export enum UebungsTyp {
  Undefined = 'Undefined',
  Custom = 'Custom',
  Kraft = 'Kraft',
  Ausdauer = 'Ausdauer',
  Dehnung = 'Dehnung',
}


export enum UebungsKategorie01 {
  Keine = 'Keine',
  GzclpT1Cycle0 = 'GzclpT1Cycle0',
  GzclpT1Cycle1 = 'GzclpT1Cycle1',
  GzclpT1Cycle2 = 'GzclpT1Cycle2',
  GzclpT2Cycle0 = 'GzclpT2Cycle0',
  GzclpT2Cycle1 = 'GzclpT2Cycle1',
  GzclpT2Cycle2 = 'GzclpT2Cycle2',
}

export enum UebungsKategorie02 {
  Stamm,
  Session,
}

export enum ArbeitsSaetzeStatus {
    KeinerVorhanden,
    NichtAlleFertig,
    AlleFertig
  }
  

export interface IUebung {
    ID: number;
    // Bei Session-Uebungen ist FkUebung der Schluessel zur Stamm-Uebung
    FkUebung: number;
    // Schluessel zur Muskel-Gruppe
    FkMuskel01: number;
    FkMuskel02: number;
    FkMuskel03: number;
    FkMuskel04: number;
    FkMuskel05: number;
    FkHantel: number;
    MuskelGruppe: string;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
    Kategorie02: UebungsKategorie02;
    SessionID: number;
    SatzListe: Array<Satz>;
    AufwaermSatzListe: Array<Satz>;
    ArbeitsSatzListe: Array<Satz>;
    AbwaermSatzListe: Array<Satz>;
    Selected: boolean;
    WarmUpVisible: boolean;
    CooldownVisible: boolean;
    IncludeWarmupWeight: boolean;
    IncludeCoolDownWeight: boolean;
    LiftedWeightVisible: boolean;
    LiftedWeight: number;
    Expanded: boolean;
    InfoLink: string;
    Beschreibung: string;
    Copy(): Uebung;
    hasChanged(aCmpUebung: IUebung): Boolean;
    FkProgress: number;
    FkAltProgress: number
    GewichtSteigerung: number;
    GewichtReduzierung: number;
    EquipmentTyp: string;
    FailCount: number;
    ArbeitsSaetzeStatus: ArbeitsSaetzeStatus;
    Vorlage: boolean;
    ListenIndex: number;
    AufwaermArbeitsSatzPause: number;
    NaechsteUebungPause: number;
    ArbeitsSatzPause1: number;
    ArbeitsSatzPause2: number;
    PauseTime1(aSatz:Satz): string;
    PauseTime2(aSatz: Satz): string;
    getPauseText(aSatzTyp: string): string;
    getFirstWaitingWorkSet(aFromIndex: number): Satz;
    nummeriereSatzListe(aSatzListe: Array<Satz>);
    ProgressGroup: string;

}

export enum StandardUebungsName {
  Squat = 'Squat',
  Deadlift = 'Deadlift',
  Benchpress = 'Benchpress',
  OverheadPress = 'Overhead-Press',
  AB_Rollout = 'AB-Rollout',
  AB_Wheel = 'AB-Wheel',
  BackExtension = 'Back-Extension',
  BarbellRow = 'Barbell-Row',
  BentOverDumbbellRaise = 'Bent-Over-Dumbbell-Raise',
  BlastStrapPushUp = 'Blast-Strap-Push-Up',
  CableKickBacks = 'Cable-Kick-Backs',
  CablePushDown = 'Cable-Push-Down',
  CableRow = 'Cable-Row',
  CalfRaises = 'Calf-Raises',
  ChestSupportedRows = 'Chest-Supported-Rows',
  ChinUps = 'Chin-Ups',
  PullUps = 'Pull-Ups',
  LatPullDowns = 'Lat-Pull-Downs',
  Dips = 'Dips',
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Uebung implements IUebung {
    public ID: number;
    // Bei Session-Uebungen ist FkUebung der Schluessel zur Stamm-Uebung
    public FkUebung: number = 0;
    public FkHantel: number = 0;
    public ListenIndex: number = 0;
    public EquipmentTyp: string = '';
    public Name: string = '';
    public Typ: UebungsTyp = UebungsTyp.Undefined;
    public FailCount: number = 3;
    public Kategorieen01: Array<UebungsKategorie01> = [];
    public Kategorie02: UebungsKategorie02 = UebungsKategorie02.Stamm;
    public SessionID: number = 0;
    public SatzListe: Array<Satz> = [];
    public Selected: boolean = false;
    public WarmUpVisible: boolean = true;
    public CooldownVisible: boolean = true;
    public LiftedWeightVisible: boolean = true;
    public IncludeWarmupWeight: boolean = false;
    public IncludeCoolDownWeight: boolean = false;
    public BodyWeight: number = 0;
    public Expanded: boolean = false;
    public InfoLink: string = '';
    public Beschreibung: string = '';
    public FkMuskel01: number = 0;
    public FkMuskel02: number = 0;
    public FkMuskel03: number = 0;
    public FkMuskel04: number = 0;
    public FkMuskel05: number = 0;
    public MuskelGruppe: string = '';
    public StammUebung: Uebung = null;
    public GewichtSteigerung: number = 0;
    public GewichtReduzierung: number = 0;
    public ArbeitsSatzPause1: number = 0;
    public ArbeitsSatzPause2: number = 0;
    public AufwaermArbeitsSatzPause: number = 0;
    public NaechsteUebungPause: number = 0;

    public Vorlage: boolean = false;
    public FkProgress: number = 0;
    public FkAltProgress: number = 0;
    public ProgressGroup: string = ProgressGroup[0];

    constructor() {
        // Nicht in Dexie-DB-Speichern -> enumerable: false
        // Object.defineProperty(this, "SatzListe", { enumerable: false });
        Object.defineProperty(this, 'pDb', { enumerable: false });
        Object.defineProperty(this, 'Selected', { enumerable: false });
        Object.defineProperty(this, 'Expanded', { enumerable: false });
        Object.defineProperty(this, 'StammUebung', { enumerable: false });
        Object.defineProperty(this, "SatzListe", { enumerable: false });
    }

    public getFirstWaitingWorkSet(aFromIndex: number = 0): Satz {
        for (let index = aFromIndex; index < this.ArbeitsSatzListe.length; index++) {
            const mPtrSatz: Satz = this.ArbeitsSatzListe[index];
            if (mPtrSatz.Status === SatzStatus.Wartet)
                return mPtrSatz;
        }
        return undefined
    }

    public nummeriereSatzListe(aSatzListe: Array<Satz>): void{
        for (let index = 0; index < aSatzListe.length; index++) {
            aSatzListe[index].SatzListIndex = index;
        }
    }

    public static StaticUebungsListeSortByListenIndex(aUebungsListe: Array<Uebung>): Array<Uebung>{
        return aUebungsListe.sort(
            (u1,u2) => 
            {
                if (u1.ListenIndex > u2.ListenIndex)
                    return 1;
                
                if (u1.ListenIndex < u2.ListenIndex)
                    return -1;
                
                return 0;
            });
    }

    public PauseTime1(aSatz:Satz): string{
        return '00:00:00';
    }

    public PauseTime2(aSatz:Satz): string{
        return '00:00:00';
    }    

    get ArbeitsSaetzeStatus(): ArbeitsSaetzeStatus {
        if (this.ArbeitsSatzListe.length <= 0) return ArbeitsSaetzeStatus.KeinerVorhanden;
        let mAnzFertig: number = 0;
        this.ArbeitsSatzListe.forEach((s) => {
            if (s.Status === SatzStatus.Fertig)
                mAnzFertig++;
        });

        if (mAnzFertig >= this.ArbeitsSatzListe.length) return ArbeitsSaetzeStatus.AlleFertig;

        return ArbeitsSaetzeStatus.NichtAlleFertig;
    }

    public getPauseText(aSatzTyp: string): string {
        return Zeitraum.FormatDauer(0);
        // return '00:00:00';
    }

    public setPauseText(aSatzTyp: SatzTyp, aValue: string) {
        
        // return '00:00:00';
    }


    public hasChanged(aCmpUebung: IUebung): Boolean {
        if (this.ID != aCmpUebung.ID) return true;
        if (this.Kategorie02 != aCmpUebung.Kategorie02) return true;
        if (this.Name != aCmpUebung.Name) return true;
        if (this.Typ != aCmpUebung.Typ) return true;

        if (this.Kategorieen01.length != aCmpUebung.Kategorieen01.length)
            return true;
        for (let index = 0; index < this.Kategorieen01.length; index++) {
            if (this.Kategorieen01[index] != aCmpUebung.Kategorieen01[index])
                return true;
        }

        if (this.SatzListe && aCmpUebung.SatzListe) {
            if (this.SatzListe.length != aCmpUebung.SatzListe.length) return true;

            for (let index = 0; index < this.SatzListe.length; index++) {
                if (this.SatzListe[index].hasChanged(aCmpUebung.SatzListe[index])) {
                    console.log('Set #' + index.toString() + ' has changed.');
                    return true;
                }
            }
        }

        return false;
    }

    public SummeWDH(): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length === 0))
            return -1;
        
        let mResult = 0;
        this.ArbeitsSatzListe.forEach(satz => {
            if(satz.Status === SatzStatus.Fertig)
                mResult += satz.WdhAusgefuehrt;
            
        });
        return mResult;
    }

    public SummeVorgabeWDH(aVorgabeWeightFrom: VorgabeWeightLimit): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length === 0))
            return -1;
        
        let mResult = 0;
        this.ArbeitsSatzListe.forEach(satz => {
            if (aVorgabeWeightFrom === VorgabeWeightLimit.LowerLimit)
                mResult += satz.WdhVonVorgabe;
            else
                mResult += satz.WdhBisVorgabe;
        });

        return mResult;
    }


    public SatzWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhAusgefuehrt;
    }

    public SatzVonVorgabeWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhVonVorgabe;
    }

    public SatzBisVorgabeWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhBisVorgabe;
    }

    public Copy(): Uebung {
        return cloneDeep(this);
    }

    public get LiftedWeight(): number {
        let mResult: number = 0;

        this.AufwaermSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        this.AbwaermSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        this.ArbeitsSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        return mResult;
    }

    private checkSatzIncludedBodyWeight(aSatzListe: Array<Satz>): Boolean {
        for (let index = 0; index < aSatzListe.length; index++) {
            const mSatz = aSatzListe[index];
            if (mSatz.IncludeBodyweight) return true;
        }
        return false;
    }

    public checkWarmUpSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.AufwaermSatzListe);
    }

    public checkCoolDownSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.AbwaermSatzListe);
    }

    public checkArbeitsSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.ArbeitsSatzListe);
    }

    public static ErzeugeGzclpKategorieen01(): Array<UebungsKategorie01> {
        return new Array<UebungsKategorie01>(
            UebungsKategorie01.GzclpT1Cycle0,
            UebungsKategorie01.GzclpT1Cycle1,
            UebungsKategorie01.GzclpT1Cycle2,
            UebungsKategorie01.GzclpT2Cycle0,
            UebungsKategorie01.GzclpT2Cycle1,
            UebungsKategorie01.GzclpT2Cycle2
        );
    }

    public isEqual(aOtherExercise: Uebung): Boolean {
        return isEqual(this,aOtherExercise);
    }

    public static StaticNeueUebung(
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>,
        aKategorie02: UebungsKategorie02,
    ): Uebung {
        //
        const mUebung = new Uebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        mUebung.Kategorie02 = aKategorie02;
        return mUebung;
    }

    public get AufwaermSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get ArbeitsSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp === SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get AbwaermSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Abwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aVonWdhVorgabe: number,
        aBisWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): Satz {
        const mSatz = new Satz({
            UebungID: this.ID,
            SatzTyp: aSatzTyp,
            Prozent: aProzent,
            WdhVonVorgabe: aVonWdhVorgabe,
            WdhBisVorgabe: aBisWdhVorgabe,
            WdhAusgefuehrt: 0,
            GewichtAusgefuehrt: 0,
            PausenMinZeit: SatzPausen.Standard_Min,
            PausenMaxZeit: SatzPausen.Standard_Max,
            Status: SatzStatus.Wartet,
            AMRAP: aAmrap,
        } as Satz);
        mSatz.LiftTyp = aLiftTyp;
        return mSatz;
    }

    public static StaticKopiere(
        aUebung: Uebung,
        aKategorie02: UebungsKategorie02
    ): Uebung {
        const mUebung = Uebung.StaticNeueUebung(
            aUebung.Name,
            aUebung.Typ,
            aUebung.Kategorieen01,
            aKategorie02
        );

        // Soll eine Session-Übung erzeugt werden? 
        if (aKategorie02 === UebungsKategorie02.Session) {
            // Es soll eine Session-Übung erzeugt werden. 
            // Deshalb muss der Fremd-Schlüssel zur Stamm-Übung gesetzt werden.

            // Ist die zu kopierende Übung (aUebung) eine Stamm-Übung?
            if (aUebung.Kategorie02 === UebungsKategorie02.Stamm)
                // Die zu kopierende Übung (aUebung) ist eine Stamm-Übung
                // Dann muss ihre ID in die neue Session-Übung gesetzt werden
                mUebung.FkUebung = aUebung.ID;
            else
                // Die zu kopierende Übung (aUebung) ist keine Stamm-Übung.
                // Dann muss ihr Fremd-Schlüssel zur Stamm-Übung gesetzt sein  
                // und in die neue Session-Übung gesetzt werden
                mUebung.FkUebung = aUebung.FkUebung;
        }
    
        return mUebung;
    }
}

export class StandardUebung {
    public Name: string;
    public StandardUebungName: StandardUebungsName;
    public Typ: UebungsTyp;
    public PrimaryMuscleGroup: MuscleGroupKategorie02;
    public SecondaryMuscleGroup: MuscleGroupKategorie02;
    public TertiaryMuscleGroup: MuscleGroupKategorie02;
    public QuaternaryMuscleGroup: MuscleGroupKategorie02;
    public QuinaryMuscleGroup: MuscleGroupKategorie02; 

    constructor(
        aName: string,
        aStandardUebungsName: StandardUebungsName,
        aTyp: UebungsTyp,
        aPrimaryMuscleGroup?: MuscleGroupKategorie02,
        aSecondaryMuscleGroup?: MuscleGroupKategorie02,
        aTertiaryMuscleGroup?: MuscleGroupKategorie02,
        aQuaternaryMuscleGroup?: MuscleGroupKategorie02,
        aQuinaryMuscleGroup?: MuscleGroupKategorie02
    ) {
        this.Name = aName;
        this.Typ = aTyp;
        this.StandardUebungName = aStandardUebungsName;
        aPrimaryMuscleGroup === undefined ? this.PrimaryMuscleGroup = MuscleGroupKategorie02.None : this.PrimaryMuscleGroup = aPrimaryMuscleGroup;
        aSecondaryMuscleGroup === undefined ? this.SecondaryMuscleGroup = MuscleGroupKategorie02.None : this.SecondaryMuscleGroup = aSecondaryMuscleGroup;
        aTertiaryMuscleGroup === undefined ? this.TertiaryMuscleGroup = MuscleGroupKategorie02.None : this.TertiaryMuscleGroup = aTertiaryMuscleGroup;
        aQuaternaryMuscleGroup === undefined ? this.QuaternaryMuscleGroup = MuscleGroupKategorie02.None : this.QuaternaryMuscleGroup = aQuaternaryMuscleGroup;
        aQuinaryMuscleGroup === undefined ? this.QuinaryMuscleGroup = MuscleGroupKategorie02.None : this.QuinaryMuscleGroup = aQuinaryMuscleGroup;
    }

    public static getStandardUebung(aStandardUebungsName: StandardUebungsName): StandardUebung{
        return StandardUebungListe.find(u => u.StandardUebungName === aStandardUebungsName);
    }
}

// Standardübungen, die bei ersten Start des Programms in die DB eingetragen werden.
export const StandardUebungListe: Array<StandardUebung> = new Array<StandardUebung>(
    new StandardUebung(
        'Squat',
        StandardUebungsName.Squat,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Quadriceps,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Hamstrings,
        MuscleGroupKategorie02.InnerAdductorMagnus),
    
    new StandardUebung(
        'Deadlift',
        StandardUebungsName.Deadlift,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Quadriceps,
        MuscleGroupKategorie02.Hamstrings,
        MuscleGroupKategorie02.LowerBack),
        
    new StandardUebung(
        'Bench-Press',
        StandardUebungsName.Benchpress,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Chest,
        MuscleGroupKategorie02.Triceps,
        MuscleGroupKategorie02.Shoulders
    ),

    new StandardUebung(
        'Overhead-Press',
        StandardUebungsName.OverheadPress,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps),

    new StandardUebung(
        'AB-Rollout',
        StandardUebungsName.AB_Rollout,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Abdominal,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps
    ),

    new StandardUebung(
        'AB-Wheel',
        StandardUebungsName.AB_Wheel,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Abdominal,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps
    ),

    new StandardUebung(
        'Back-Extension',
        StandardUebungsName.BackExtension,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back
    ),

    new StandardUebung(
        'Barbell-Row',
        StandardUebungsName.BarbellRow,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Bent-Over-Dumbbell-Raise',
        StandardUebungsName.BentOverDumbbellRaise,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Shoulders
    ),

    new StandardUebung(
        'Cable-Kick-Backs',
        StandardUebungsName.CableKickBacks,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Hamstrings
    ),
    
    new StandardUebung(
        'Cable-Push-Down',
        StandardUebungsName.CablePushDown,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Arms,
        MuscleGroupKategorie02.Triceps
    ),
    
    new StandardUebung(
        'Cable-Row',
        StandardUebungsName.CableRow,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Calf-Raises',
        StandardUebungsName.CalfRaises,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Calves
    ),

    new StandardUebung(
        'Chest-Supported-Rows',
        StandardUebungsName.ChestSupportedRows,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Chin-Ups',
        StandardUebungsName.ChinUps,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Lat-Pull-Downs',
        StandardUebungsName.LatPullDowns,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps        
    ),

    new StandardUebung(
        'Pull-Ups',
        StandardUebungsName.Dips,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Arms
    ),

    new StandardUebung(
        'Dips',
        StandardUebungsName.Dips,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Arms,
        MuscleGroupKategorie02.Triceps,
        MuscleGroupKategorie02.Chest,
        MuscleGroupKategorie02.Shoulders
    )
);