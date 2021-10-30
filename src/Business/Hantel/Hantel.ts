var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export enum HantelTyp {
    Barbell = 'Barbell',
    // CurlBar = 'CurlBar'
    // SwissBar = 'SwissBar',
    // HexBar = 'HexBar',
    Dumbbel = 'Dumbbel'
}

export enum HantelErstellStatus {
    VomAnwenderErstellt,
    AutomatischErstellt,
    Geloescht
}


export class IHantel {
    Name: string;
    Typ: HantelTyp;
    Durchmesser: number;
    HantelStatus: HantelErstellStatus; 
}

export class Hantel implements IHantel {
    ID: number; 
    Name: string = "";
    Typ: HantelTyp = HantelTyp.Barbell;
    Durchmesser: number = 0;
    HantelStatus: HantelErstellStatus = HantelErstellStatus.VomAnwenderErstellt; 

    public static StaticNeueHantel(
        aName: string,
        aTyp: HantelTyp,
        aDurchmesser: number,
        aHantelStatus: HantelErstellStatus
    ): Hantel {
        const mResult: Hantel = new Hantel();
        mResult.Name = aName;
        mResult.Typ = aTyp;
        mResult.Durchmesser = aDurchmesser;
        mResult.HantelStatus = aHantelStatus;
        return mResult;
    }

    public Copy(): Hantel {
        return cloneDeep(this);
    }

    public isEqual(aOtherHantel: Hantel): Boolean {
        return isEqual(this,aOtherHantel);
    }
}


export class LanghantelTyp {
    ID: number;
    Typ: HantelTyp = HantelTyp.Barbell;
    DisplayName: string = '';

    public static StaticLanghantelTypListe(): Array<LanghantelTyp> {
        const mResult: Array<LanghantelTyp> = new Array<LanghantelTyp>();
        for (const mTyp in HantelTyp) {
            if (mTyp === HantelTyp.Dumbbel)
                continue;
            
            const mLanghantelTyp: LanghantelTyp = new LanghantelTyp();
            mLanghantelTyp.Typ = LanghantelTyp[mTyp];
            mLanghantelTyp.DisplayName = mTyp;
            mResult.push(mLanghantelTyp); 
        }

        return mResult.sort((u1: LanghantelTyp, u2: LanghantelTyp) => {
            if (u1.DisplayName > u2.DisplayName) {
                return 1;
            }
        
            if (u1.DisplayName < u2.DisplayName) {
                return -1;
            }
        
            return 0;
         });
    }
}

