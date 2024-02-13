import { formatNumber } from "@angular/common";
import { DexieSvcService, cWeightFormat } from "src/app/services/dexie-svc.service";
import { Datum } from '../Datum';
import { AppData, GewichtsEinheit } from "../Coach/Coach";


var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export class BodyWeightDB {
    ID: number;
    Datum: Date;
    Weight: number = 0;
    GewichtsEinheit: GewichtsEinheit = DexieSvcService.GewichtsEinheit;
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
        return Datum.StaticFormatDate(this.Datum);
    }
    //#endregion
    //#region Weight 
    get Weight(): number {
        if (this.GewichtsEinheit !== DexieSvcService.GewichtsEinheit)
            return AppData.StaticConvertWeight(this.BodyWeightDB.Weight, DexieSvcService.GewichtsEinheit);

        return Number(this.BodyWeightDB.Weight);
    }
    set Weight(aVal: number) {
        if (this.GewichtsEinheit !== DexieSvcService.GewichtsEinheit)
            aVal = AppData.StaticConvertWeight(this.BodyWeightDB.Weight, DexieSvcService.GewichtsEinheit);

        this.BodyWeightDB.Weight = Number(aVal);
    }

    get WeightTxt(): string {
        return formatNumber(this.Weight,'en-US',cWeightFormat);
    }
    //#endregion

    //#region GewichtsEinheit
    get GewichtsEinheit(): GewichtsEinheit {
        return this.BodyWeightDB.GewichtsEinheit;
    }
    set GewichtsEinheit(value: GewichtsEinheit) {
        this.BodyWeightDB.GewichtsEinheit = value;;
    }
    //#endregion


    public Copy(): BodyWeight {
        return cloneDeep(this);
    }

    public isEqual(aOtherBodyWeight: BodyWeight): Boolean {
        return isEqual(this,aOtherBodyWeight);
    }
}
