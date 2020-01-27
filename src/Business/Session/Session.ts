import { ISatz } from '../Konfiguration/Satz';


export interface ISession {
    ID: number;
    TagNr: number;
    Name: string;
    Saetze: Array<ISatz>;
    Datum: Date;
    DauerInSek: number;
    Copy(): ISession;
}

export class Session implements ISession {
    public ID: number;
    public TagNr: number;
    public Name: string;
    public Saetze: Array<ISatz>;
    public Datum: Date;
    public DauerInSek: number;

    constructor(aPara: Session = {} as Session) {
        this.ID = aPara.ID;
        this.Name = aPara.Name;
        this.Saetze = aPara.Saetze ? aPara.Saetze : [];
        this.Datum = aPara.Datum;
        this.DauerInSek = aPara.DauerInSek;
        this.TagNr = aPara.TagNr;
    }

    public Copy(): ISession {
        const mResult = new Session();
        mResult.ID = this.ID;
        mResult.Name = this.Name;
        mResult.Datum = this.Datum;
        mResult.DauerInSek = this.DauerInSek;
        mResult.TagNr = this.TagNr;
        this.Saetze.forEach(mSatz => mResult.Saetze.push(mSatz.Copy()) );
        return mResult;
    }
}

