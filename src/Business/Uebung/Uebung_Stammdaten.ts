enum UebungsTyp {
    Kraft,
    Ausdauer,
    Dehnung,
    Custom
}

interface IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
}

class StammUebung implements IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
}
