import { MuscleGroup, MuscleGroupKategorie02 } from '../MuscleGroup/MuscleGroup';
import { Satz, SatzTyp, LiftTyp, SatzPausen, SatzStatus } from './../Satz/Satz';

var cloneDeep = require('lodash.clonedeep');

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
    public Name: string = '';
    public Typ: UebungsTyp = UebungsTyp.Undefined;
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


    constructor() {
        // Nicht in Dexie-DB-Speichern -> enumerable: false
        // Object.defineProperty(this, "SatzListe", { enumerable: false });
        Object.defineProperty(this, 'Selected', { enumerable: false });
        Object.defineProperty(this, 'Expanded', { enumerable: false });
        Object.defineProperty(this, 'StammUebung', { enumerable: false });
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
        aWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): Satz {
        const mSatz = new Satz({
            UebungID: this.ID,
            SatzTyp: aSatzTyp,
            Prozent: aProzent,
            WdhVorgabe: aWdhVorgabe,
            WdhAusgefuehrt: 0,
            GewichtVorgabe: 0,
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