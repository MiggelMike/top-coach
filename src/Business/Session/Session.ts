import { ISatz } from '../Satz/Satz';
import { JsonProperty } from '@peerlancers/json-serialization';


export interface ISession {
    ID: number;
    FK_Programm: number;
    TagNr: number;
    Name: string;
    Saetze: Array<ISatz>;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
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
    public Expanded: Boolean;

    constructor(aPara: Session = {} as Session) {
        this.ID = aPara.ID;
        this.Name = aPara.Name ? aPara.Name : 'Day ' + aPara.TagNr.toString(),
        this.Saetze = aPara.Saetze ? aPara.Saetze : [];
        this.Datum = aPara.Datum;
        this.DauerInSek = aPara.DauerInSek;
        this.TagNr = aPara.TagNr;
        this.FK_Programm = aPara.FK_Programm;
        this.Expanded = aPara.Expanded ? aPara.Expanded : true;
    }

    public Copy(): ISession {
        const mResult = new Session(
            {
                ID: this.ID,
                TagNr: this.TagNr,
                Saetze: [],
                Datum: this.Datum,
                DauerInSek: this.DauerInSek,
                FK_Programm: this.FK_Programm,
                Expanded: this.Expanded
            } as Session
        );
        this.Saetze.forEach(mSatz => mResult.Saetze.push(mSatz.Copy()) );
        return mResult;
    }
}

