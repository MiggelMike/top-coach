import { UebungsTyp, UebungsKategorie01, Uebung, IUebung } from './Uebung';
// import { JsonProperty } from '@peerlancers/json-serialization';

export interface IStammUebung extends IUebung{

} 

export class Uebung_Stamm extends Uebung implements IUebung {

    public static NeueStammUebung(
        aID: number,
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>): IUebung {
        //
        const mUebung = new Uebung_Stamm();
        mUebung.ID = aID;
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
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
}
