export enum UebungsTyp {
    Custom = 'Custom',
    Kraft = 'Kraft',
    Ausdauer = 'Ausdauer',
    Dehnung = 'Dehnung',
}

export enum UebungsKategorie01 {
    GzclpT1Cycle0 = 'GzclpT1Cycle0',
    GzclpT1Cycle1 = 'GzclpT1Cycle1',
    GzclpT1Cycle2 = 'GzclpT1Cycle2',
    GzclpT2Cycle0 = 'GzclpT2Cycle0',
    GzclpT2Cycle1 = 'GzclpT2Cycle1',
    GzclpT2Cycle2 = 'GzclpT2Cycle2',
}

export enum UebungsKategorie02 {
    GzclpA1_1,
    GzclpA1_2,
    GzclpA1_3,
    GzclpA1_4,
    GzclpA2_1,
    GzclpA2_2,
    GzclpA2_3,
    GzclpA2_4,
    GzclpB1_1,
    GzclpB1_2,
    GzclpB1_3,
    GzclpB1_4,
    GzclpB2_1,
    GzclpB2_2,
    GzclpB2_3,
    GzclpB2_4,
}

class Vorgaben {
    Gzclp: {
        UebungsKategorie01: UebungsKategorie01.GzclpT1Cycle1
    };
}


export interface IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
    Kategorieen02: Array<UebungsKategorie02>;
}

export class StammUebung implements IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01> = [];
    Kategorieen02: Array<UebungsKategorie02> = [];

    public static NeueStammUebung(
        aID: number,
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>,
        aKategorieen02: Array<UebungsKategorie02>): IStammUebung {
        //
        const mUebung = new StammUebung();
        mUebung.ID = aID;
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        mUebung.Kategorieen02 = aKategorieen02 ? aKategorieen02 : [];
        return mUebung;
    }

    public static ErzeugeGzclpKategorieen01(): Array<UebungsKategorie01> {
        return new Array<UebungsKategorie01>(
            UebungsKategorie01.GzclpT1Cycle0,
            UebungsKategorie01.GzclpT1Cycle1,
            UebungsKategorie01.GzclpT1Cycle2,
            UebungsKategorie01.GzclpT2Cycle0,
            UebungsKategorie01.GzclpT2Cycle1,
            UebungsKategorie01.GzclpT2Cycle2,
         );
    }

    public static ErzeugeGzclpAKategorieen(): Array<UebungsKategorie02> {
        return new Array<UebungsKategorie02>(
            UebungsKategorie02.GzclpA1_1,
            UebungsKategorie02.GzclpA2_2,
            UebungsKategorie02.GzclpB1_1,
            UebungsKategorie02.GzclpB2_2,
        );
    }

    public static ErzeugeGzclpBKategorieen(): Array<UebungsKategorie02> {
        return new Array<UebungsKategorie02>(
            UebungsKategorie02.GzclpB1_1,
            UebungsKategorie02.GzclpB2_2,
        );
    }

    public static ErzeugeGzclpCKategorieen(): Array<UebungsKategorie02> {
        return new Array<UebungsKategorie02>(
            UebungsKategorie02.GzclpB1_1,
            UebungsKategorie02.GzclpB1_2,
            UebungsKategorie02.GzclpB1_3,
            UebungsKategorie02.GzclpB1_4,
        );
    }

    public static ErzeugeGzclpTag4Kategorieen(): Array<UebungsKategorie02> {
        return new Array<UebungsKategorie02>(
            UebungsKategorie02.GzclpB2_1,
            UebungsKategorie02.GzclpB2_2,
            UebungsKategorie02.GzclpB2_3,
            UebungsKategorie02.GzclpB2_4,
        );
    }
}
