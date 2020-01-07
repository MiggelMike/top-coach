export enum UebungsTyp {
    Kraft,
    Ausdauer,
    Dehnung,
    Custom
}

export interface IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
}

export class StammUebung implements IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;

    public static NeueStammUebung(aName: string, aTyp: UebungsTyp): IStammUebung {
        const mUebung = new StammUebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        return mUebung;
    }
}
