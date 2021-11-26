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
    Gewicht: number = 0;
    Anzahl: number = 0;

    public Copy(): Hantelscheibe {
        return cloneDeep(this);
    }
}
