export interface ISportler {
    ID: number;
    Geburtstag: Date;
    FertigeSessions: Array<IKonkreteSession>;
    AnstehendeSessions: Array<IKonkreteSession>;
    Koerpergewicht: Array<IKoerpergewicht>;
}

export class Sportler implements ISportler {
    public ID: number;
    public Geburtstag: Date;
    public FertigeSessions: Array<IKonkreteSession>;
    public AnstehendeSessions: Array<IKonkreteSession>;
    public Koerpergewicht: Array<IKoerpergewicht>;

    constructor() {
        this.ID = 0;
        this.Geburtstag = null;
        this.FertigeSessions = [];
        this.Koerpergewicht = [];
    }

    public GetAnstehendeSessions(aMaxAnz: number | void): Array<IKonkreteSession> {
        return null;
    }

    public GetAktuellesKoerpergewicht(): IKoerpergewicht {
        return null;
    }
}
