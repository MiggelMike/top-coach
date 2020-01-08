import { ISession } from '../Session/Session';

export interface ISportler {
    ID: number;
    Geburtstag: Date;
    FertigeSessions: Array<ISession>;
    AnstehendeSessions: Array<ISession>;
    Koerpergewicht: Array<IKoerpergewicht>;
    Reset(): void;
}

export class Sportler implements ISportler {
    public ID: number;
    public Geburtstag: Date;
    public FertigeSessions: Array<ISession>;
    public AnstehendeSessions: Array<ISession>;
    public Koerpergewicht: Array<IKoerpergewicht>;

    constructor() {
        this.ID = 0;
        this.Geburtstag = null;
        this.Koerpergewicht = [];
        this.Reset();
    }

    public GetAnstehendeSessions(aMaxAnz: number | void): Array<ISession> {
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
