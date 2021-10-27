import { isDefined } from '@angular/compiler/src/util';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export enum EquipmentOrigin {
    Unbestimmt = "Unbestimmt",
    Standard = "Standard",
    Anwender = "Anwender"
}

export enum EquipmentTyp {
    Unbestimmt = "Unbestimmt",
    Barbell = "Barbell",
    Dumbbell = "Dumbbell",
    Plate = "Plate"
}

export interface IEquipment {
    ID: number;
    Name: string;
    DisplayName: string;
    Durchmesser: number;
    EquipmentTyp: EquipmentTyp; 
    EquipmentOrigin: EquipmentOrigin;
}

export class Equipment implements  IEquipment {
    ID: number;
    Name: string = '';
    DisplayName: string;
    Durchmesser: number = 0; 
    EquipmentOrigin: EquipmentOrigin = EquipmentOrigin.Unbestimmt;
    EquipmentTyp: EquipmentTyp = EquipmentTyp.Unbestimmt; 

    public static StaticNeuesEquipment(
        aName: string,
        aOrigin: EquipmentOrigin,
        aTyp: EquipmentTyp,
        aDisplayName?: string,
        aDurchmesser?: number
    ): Equipment
    {
        const mEquipment: Equipment = new Equipment();
        mEquipment.EquipmentTyp = aTyp;
        mEquipment.EquipmentOrigin = aOrigin;
        mEquipment.Name = aName;

        isDefined(aDurchmesser) ? mEquipment.DisplayName = aDisplayName : mEquipment.DisplayName = aName;
        
        if (isDefined(aDurchmesser))
            mEquipment.Durchmesser = aDurchmesser;
        
        return mEquipment;
    }
}



