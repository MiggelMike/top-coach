import { Basis, IBasis } from './../Basis/Basis';
import { isDefined } from '@angular/compiler/src/util';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export enum HantelTyp {
    Barbell = 'Barbell',
    CurlBar = 'CurlBar',
    SwissBar = 'SwissBar',
    HexBar = 'HexBar',
    Dumbbel = 'Dumbbel'
}

export class IHantel {
    
    Name: string;
    DisplayName: string;
    Typ: HantelTyp;
    Durchmesser: number;
    Geloescht: Boolean; 
}

export class Hantel implements IHantel {
    ID: number; 
    Name: string = "";
    DisplayName: string = "";
    Typ: HantelTyp = HantelTyp.Barbell;
    Durchmesser: number = 0;
    Geloescht: Boolean = false; 

    public static StaticNeueHantel(
        aName: string,
        aTyp: HantelTyp,
        aDurchmesser: number,
        aGeloescht: Boolean,
        aDisplayName?: string
    ): Hantel {
        const mResult: Hantel = new Hantel();
        mResult.Name = aName;
        mResult.Typ = aTyp;
        mResult.Durchmesser = aDurchmesser;
        mResult.Geloescht = aGeloescht;
        isDefined(aDisplayName) ? mResult.DisplayName = aDisplayName : aName;
        return mResult;
    }

    public Copy(): Hantel {
        return cloneDeep(this);
    }

    public isEqual(aOtherEquipment: Equipment): Boolean {
        return isEqual(this,aOtherEquipment);
    }
}
