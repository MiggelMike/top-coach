import { GlobalService } from 'src/app/services/global.service';
import { formatNumber } from "@angular/common";
import { DexieSvcService, cWeightFormat } from "src/app/services/dexie-svc.service";


var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export class BodyWeightDB {
    ID: number;
    Datum: Date;
    Weight: number = 0;
}

export class BodyWeight {
    BodyWeightDB: BodyWeightDB;
    
    constructor(aBodyWeightDB: BodyWeightDB = undefined) {
        if (aBodyWeightDB === undefined)
            this.BodyWeightDB = new BodyWeightDB();
        else
            this.BodyWeightDB = aBodyWeightDB;
    }

    //#region ID
    get ID(): number {
        return this.BodyWeightDB.ID;
    }

    set ID(aVal: number) {
        this.BodyWeightDB.ID = aVal;
    }
    //#endregion
    //#region Datum
    get Datum(): Date {
        return this.BodyWeightDB.Datum;
    }
    set Datum(aVal: Date) {
        this.BodyWeightDB.Datum = aVal;
    }

    get DatumTxt(): string {
        return GlobalService.StaticFormatDate(this.Datum);
    }
    //#endregion
    //#region Weight 
    get Weight(): number {
        return Number(this.BodyWeightDB.Weight);
    }
    set Weight(aVal: number) {
        this.BodyWeightDB.Weight = Number(aVal);
    }

    get WeightTxt(): string {
        return formatNumber(this.Weight,'en-US',cWeightFormat);
    }
    //#endregion

    public Copy(): BodyWeight {
        return cloneDeep(this);
    }

    public isEqual(aOtherBodyWeight: BodyWeight): Boolean {
        return isEqual(this,aOtherBodyWeight);
    }
}
