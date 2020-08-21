import { ISession } from 'src/Business/Session/Session';
import { ISatz, INeuerSatz, SatzTyp, LiftTyp } from './../Satz/Satz';
import { UebungsTyp, UebungsKategorie01, Uebung, IUebung } from './Uebung';
import { JsonProperty } from '@peerlancers/json-serialization';

export interface IUebung_Sess{
    SatzListe: Array<ISatz>;
    Copy(): IUebung_Sess;
}

export class Uebung_Sess implements IUebung_Sess, INeuerSatz {
    @JsonProperty()
    public SatzListe: Array<ISatz> = new Array<ISatz>();
    @JsonProperty()
    public Uebung: IUebung;
    
    public get AufwaermSatzListe(): Array<ISatz>{
        const mResult = Array<ISatz>();
        this.SatzListe.forEach(mSatz => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get ArbeitsSatzListe(): Array<ISatz>{
        const mResult = Array<ISatz>();
        this.SatzListe.forEach(mSatz => {
            if (mSatz.SatzTyp == SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get AbwaermSatzListe(): Array<ISatz>{
        const mResult = Array<ISatz>();
        this.SatzListe.forEach(mSatz => {
            if (mSatz.SatzTyp == SatzTyp.Abwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    constructor(aUebung: IUebung) {
        this.Uebung = aUebung.Copy();
    }

    public Copy(): IUebung_Sess{
        const mUebung_Sess = new Uebung_Sess(this.Uebung);
        mUebung_Sess.SatzListe.forEach(mSatz => mUebung_Sess.SatzListe.push(mSatz.Copy()));
        return mUebung_Sess;
    };

    public NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aSession: ISession,
        aUebung: IUebung,
        aAmrap: boolean
    ): ISatz{
        return null;
    }
} 