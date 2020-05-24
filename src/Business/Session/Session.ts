import { ISatz } from '../Konfiguration/Satz';
import { JsonProperty } from '@peerlancers/json-serialization';


export interface ISession {
    ID: number;
    FK_Programm: number;
    TagNr: number;
    Name: string;
    Saetze: Array<ISatz>;
    Datum: Date;
    DauerInSek: number;
    Copy(): ISession;
}

export class Session implements ISession {
    @JsonProperty()
    public ID: number;
    @JsonProperty()
    public FK_Programm: number;
    @JsonProperty()
    public TagNr: number;
    @JsonProperty()
    public Name: string;
    @JsonProperty()
    public Saetze: Array<ISatz>;
    @JsonProperty()
    public Datum: Date;
    @JsonProperty()
    public DauerInSek: number;

    constructor(aPara: Session = {} as Session) {
        this.ID = aPara.ID;
        this.Name = aPara.Name;
        this.Saetze = aPara.Saetze ? aPara.Saetze : [];
        this.Datum = aPara.Datum;
        this.DauerInSek = aPara.DauerInSek;
        this.TagNr = aPara.TagNr;
        this.FK_Programm = aPara.FK_Programm;
    }

    public Copy(): ISession {
        const mResult = new Session();
        mResult.ID = this.ID;
        mResult.Name = this.Name;
        mResult.Datum = this.Datum;
        mResult.DauerInSek = this.DauerInSek;
        mResult.TagNr = this.TagNr;
        mResult.FK_Programm = this.FK_Programm;
        this.Saetze.forEach(mSatz => mResult.Saetze.push(mSatz.Copy()) );
        return mResult;
    }
}

