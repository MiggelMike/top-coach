import { ErstellStatus } from 'src/app/services/dexie-svc.service';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export enum MuscleGroupKategorie01 {
    Undefiniert, Stamm, Anwender   
}

export enum MuscleGroupKategorie02 {
    None = 'None',
    Legs = 'Legs',
    Quadriceps = 'Quadriceps',
    Arms = 'Arms',
    Chest = 'Chest',
    Back = 'Back',
    Abdominal = 'Abdominal',
    Shoulders = 'Shoulders',
    Hamstrings = 'Hamstrings',
    Glutes = 'Glutes',
    LowerBack = 'LowerBack',
    InnerAdductorMagnus = 'Inner-Adductor-Magnus',
    Triceps = 'Triceps',
    Biceps = 'Biceps',
    Calves = 'Calves', 
    Neck = 'Neck' 
}


export interface IMuscleGroup {
    ID: number;
    Name: string;
    Bemerkung: string;
    MuscleGroupKategorie01: MuscleGroupKategorie01;
    Status: ErstellStatus;
}

export class MuscleGroup implements IMuscleGroup {
    public ID: number;
    public Name: string = '';
    public Bemerkung: string = '';
    public MuscleGroupKategorie01: MuscleGroupKategorie01 = MuscleGroupKategorie01.Undefiniert;
    public Status: ErstellStatus = ErstellStatus.VomAnwenderErstellt;

    constructor() { }
    
    public static StaticNeueMuskelGruppe(
        aName: string,
        aMuscleGroupKategorie01: MuscleGroupKategorie01): MuscleGroup
    {
        const mMuscleGroup: MuscleGroup = new MuscleGroup();
        mMuscleGroup.MuscleGroupKategorie01 = aMuscleGroupKategorie01;
        mMuscleGroup.Name = aName;
        return mMuscleGroup;
    }

    public static StaticCopy(aQuelle: MuscleGroup): MuscleGroup {
        return cloneDeep(aQuelle); 
    }

    public static  StaticIsEqual(aMuscleGroup1: MuscleGroup, aMuscleGroup2: MuscleGroup): Boolean {
        return isEqual(aMuscleGroup1,aMuscleGroup2);
    }
}

// StandardMuskel-Gruppen, die bei ersten Start des Programms in die DB eingetragen werden.
export var StandardMuscleGroup: Array<MuscleGroupKategorie02> = new Array<MuscleGroupKategorie02>(
    MuscleGroupKategorie02.Legs,
    MuscleGroupKategorie02.Chest,
    MuscleGroupKategorie02.Arms,
    MuscleGroupKategorie02.Back,
    MuscleGroupKategorie02.Shoulders,
    MuscleGroupKategorie02.Abdominal
)
    

