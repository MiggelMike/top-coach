export enum UebungsTyp {
    Custom = 'Custom',
    Kraft = 'Kraft',
    Ausdauer = 'Ausdauer',
    Dehnung = 'Dehnung',
}

export enum UebungsKategorie {
    Custom = 'Custom',
    GzclpT1Cycle0 = 'GzclpT1Cycle0',
    GzclpT1Cycle1 = 'GzclpT1Cycle1',
    GzclpT1Cycle2 = 'GzclpT1Cycle2',
    GzclpT2Cycle0 = 'GzclpT2Cycle0',
    GzclpT2Cycle1 = 'GzclpT2Cycle1',
    GzclpT2Cycle2 = 'GzclpT2Cycle2',
}


export interface IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie>;
}

export class StammUebung implements IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie> = [];

    public static NeueStammUebung(aName: string, aTyp: UebungsTyp, aKategorieen01: Array<UebungsKategorie>): IStammUebung {
        const mUebung = new StammUebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01;
        return mUebung;
    }

    public static ErzeugeGzclpKategorieen(): Array<UebungsKategorie> {
        return new Array<UebungsKategorie>(
            UebungsKategorie.GzclpT1Cycle0,
            UebungsKategorie.GzclpT1Cycle1,
            UebungsKategorie.GzclpT1Cycle2,
            UebungsKategorie.GzclpT2Cycle0,
            UebungsKategorie.GzclpT2Cycle1,
            UebungsKategorie.GzclpT2Cycle2,
         );
    }

    public static ErzeugeStandardKategorieen(): Array<UebungsKategorie> {
        const mResult = new Array<UebungsKategorie>();
        mResult.push(UebungsKategorie.Custom);
        return mResult;
    }


}
