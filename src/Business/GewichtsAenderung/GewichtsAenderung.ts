var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export class GewichtAenderung {
    ID: number;
    Name: string = '';
    Gewicht: number = 0;
    
}

export class GewichtPlus extends GewichtAenderung {
    AbWdh: number = 0;

    public Copy(): GewichtPlus {
        return cloneDeep(this); 
    }

    public isEqual(aOtherGewichtPlus: GewichtPlus): Boolean {
        return isEqual(this,aOtherGewichtPlus);
    }
}

export class GewichtMinus extends GewichtAenderung {
    MaxAnzahlFehlversuche: number = 0;

    public Copy(): GewichtMinus {
        return cloneDeep(this); 
    }

    public isEqual(aOtherGewichtMinus: GewichtMinus): Boolean {
        return isEqual(this,aOtherGewichtMinus);
    }
}