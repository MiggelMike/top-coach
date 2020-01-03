enum GewichtsTyp {
    KG = 1,
    lb = 0.45359237 * 2
}

interface IGewicht {
    Einheit: GewichtsTyp;
    Wert: number;
}

class Gewicht {
    Einheit: GewichtsTyp;
    Wert: number;
}

interface IKoerpergewicht {
    ID: number;
    Datum: Date;
    Gewicht: IGewicht;
}

class Koerpergewicht implements IKoerpergewicht {
    ID: number;
    Datum: Date;
    Gewicht: IGewicht;
}
