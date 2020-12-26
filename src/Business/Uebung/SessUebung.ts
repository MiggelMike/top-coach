import { ISession } from "src/Business/Session/Session";
import { ISatz, Satz, INeuerSatz, SatzTyp, LiftTyp, SatzPausen, SatzStatus } from "../Satz/Satz";
import { UebungsTyp, UebungsKategorie01, Uebung, IUebung } from "./Uebung";
import { JsonProperty } from "@peerlancers/json-serialization";

export interface ISessUebung extends IUebung {
    Session: ISession;
    Uebung: IUebung;
    SatzListe: Array<ISatz>;
    Copy(): ISessUebung;
    NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): ISatz; 
}

export class SessUebung extends Uebung implements ISessUebung {
    @JsonProperty()
    Session: ISession;
    @JsonProperty()
    public SatzListe: Array<ISatz> = new Array<ISatz>();
    @JsonProperty()
    public Uebung: IUebung;

    get Name():string {
        return this.Uebung.Name;
    }

    public get AufwaermSatzListe(): Array<ISatz> {
        const mResult = Array<ISatz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get ArbeitsSatzListe(): Array<ISatz> {
        const mResult = Array<ISatz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp === SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get AbwaermSatzListe(): Array<ISatz> {
        const mResult = Array<ISatz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Abwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    constructor(aSession: ISession, aUebung: IUebung) {
        super();
        this.Session = aSession;
        this.Uebung = aUebung.Copy();
    }

    public Copy(): ISessUebung {
        const mUebung_Sess = new SessUebung(this.Session, this.Uebung);
        this.SatzListe.forEach((mSatz) =>
            mUebung_Sess.SatzListe.push(mSatz.Copy())
        );
        return mUebung_Sess;
    }

    public NeuerSatz( 
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): ISatz {
        const mSatz = new Satz(
            { UebungID : this.Uebung.ID,
              SatzTyp : aSatzTyp,
              Prozent : aProzent,
              WdhVorgabe : aWdhVorgabe,
              WdhAusgefuehrt : 0,
              GewichtVorgabe : 0,
              GewichtAusgefuehrt : 0,
              PausenMinZeit : SatzPausen.Standard_Min,
              PausenMaxZeit : SatzPausen.Standard_Max,
              Status : SatzStatus.Wartet,
              AMRAP : aAmrap
            } as Satz);
        mSatz.LiftTyp = aLiftTyp;
        return mSatz;
    }
}
