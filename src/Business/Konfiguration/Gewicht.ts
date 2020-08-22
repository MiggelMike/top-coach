export enum GewichtsTyp {
    KG = 1,
    lb = 0.45359237 * 2
}

export interface IGewicht {
    Einheit: GewichtsTyp;
    Wert: number;
}

export class Gewicht {
    Einheit: GewichtsTyp;
    Wert: number;
}

export interface IKoerpergewicht {
    ID: number;
    Datum: Date;
    Gewicht: IGewicht;
}

class Koerpergewicht implements IKoerpergewicht {
    ID: number;
    Datum: Date;
    Gewicht: IGewicht;
}
