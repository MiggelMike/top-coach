import { IKonkreteSession } from '../Session/Session';

export interface ISportler {
    ID: number;
    Geburtstag: Date;
    FertigeSessions: Array<IKonkreteSession>;
    AnstehendeSessions: Array<IKonkreteSession>;
    Koerpergewicht: Array<IKoerpergewicht>;
    Reset(): void;
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
        this.Koerpergewicht = [];
        this.Reset();
    }

    public GetAnstehendeSessions(aMaxAnz: number | void): Array<IKonkreteSession> {
        return null;
    }

    public GetAktuellesKoerpergewicht(): IKoerpergewicht {
        return null;
    }

    public Reset(): void {
        this.FertigeSessions = [];
        this.AnstehendeSessions = [];
    }
}
