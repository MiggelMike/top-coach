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
    DisplayName: string | undefined;
    Durchmesser: number | undefined;
    EquipmentTyp: EquipmentTyp; 
    EquipmentOrigin: EquipmentOrigin;
    Bemerkung: string;
}

export class Equipment implements  IEquipment {
    ID: number;
    Name: string = '';
    DisplayName: string | undefined = '';
    Durchmesser: number | undefined = 0; 
    EquipmentOrigin: EquipmentOrigin = EquipmentOrigin.Unbestimmt;
    EquipmentTyp: EquipmentTyp = EquipmentTyp.Unbestimmt; 
    Bemerkung: string = '';

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

        (aDisplayName !== undefined) ? mEquipment.DisplayName = aDisplayName : mEquipment.DisplayName = aName;
        
        if (aDurchmesser !== undefined)
            mEquipment.Durchmesser = aDurchmesser;
        
        return mEquipment;
    }

    public Copy(): Equipment {
        return cloneDeep(this); 
    }

    public isEqual(aOtherEquipment: Equipment): Boolean {
        return isEqual(this,aOtherEquipment);
    }
}



