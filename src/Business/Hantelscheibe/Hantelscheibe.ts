var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');


export class IHantelscheibe  {
    ID: number;
    Durchmesser: number;
    Gewicht: number;
    Anzahl: number;
}

export class Hantelscheibe implements  IHantelscheibe  {
    ID: number;
    Durchmesser: number = 0;
    // get Durchmesser(): number {
    //     return Number(this.fDurchmesser);
    // }
    // set Durchmesser(aValue: number) {
    //     this.fDurchmesser = Number(aValue);
    // }

    Gewicht: number = 0;
    // get Gewicht(): number {
    //     return this.fGewicht;
    // }
    // set Gewicht( aValue: number) {
    //     this.fGewicht = Number(aValue);
    // }

    fAnzahl: number = 0;
    get Anzahl(): number{
        return this.fAnzahl;
    }
    set Anzahl( aValue: number){
        this.fAnzahl = aValue;
    }

    public Copy(): Hantelscheibe {
        return cloneDeep(this);
    }

    public isEqual(aOtherHantelscheibe: Hantelscheibe): Boolean {
        return isEqual(this,aOtherHantelscheibe);
    }
}
