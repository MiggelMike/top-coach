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
    GzclpTag1_1,
    GzclpTag1_2,
    GzclpTag1_3,
    GzclpTag1_4,
    GzclpTag2_1,
    GzclpTag2_2,
    GzclpTag2_3,
    GzclpTag2_4,
    GzclpTag3_1,
    GzclpTag3_2,
    GzclpTag3_3,
    GzclpTag3_4,
    GzclpTag4_1,
    GzclpTag4_2,
    GzclpTag4_3,
    GzclpTag4_4,
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

    public static ErzeugeGzclpKategorieen02(): Array<UebungsKategorie02> {
        return new Array<UebungsKategorie02>(
            UebungsKategorie02.GzclpTag1_1,
            UebungsKategorie02.GzclpTag1_2,
            UebungsKategorie02.GzclpTag1_3,
            UebungsKategorie02.GzclpTag1_4,
            UebungsKategorie02.GzclpTag2_1,
            UebungsKategorie02.GzclpTag2_2,
            UebungsKategorie02.GzclpTag2_3,
            UebungsKategorie02.GzclpTag2_4,
            UebungsKategorie02.GzclpTag3_1,
            UebungsKategorie02.GzclpTag3_2,
            UebungsKategorie02.GzclpTag3_3,
            UebungsKategorie02.GzclpTag3_4,
            UebungsKategorie02.GzclpTag4_1,
            UebungsKategorie02.GzclpTag4_2,
            UebungsKategorie02.GzclpTag4_3,
            UebungsKategorie02.GzclpTag4_4,
        );
    }
}
