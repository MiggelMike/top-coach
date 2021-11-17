import { ErstellStatus } from 'src/app/services/dexie-svc.service';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export enum MuscleGroupKategorie01 {
    Undefiniert, Stamm, Anwender   
}

export enum MuscleGroupKategorie02 {
    Legs = 'Legs',
    Arms = 'Arms',
    Chest = 'Chest',
    Back = 'Back',
    Abdominal = 'Abdominal',
    Shoulders = 'Shoulders'
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

    public Copy(): MuscleGroup {
        return cloneDeep(this); 
    }

    public isEqual(aOtherMuscleGroup: MuscleGroup): Boolean {
        return isEqual(this,aOtherMuscleGroup);
    }
}