import { ISession } from '../Session/Session';
import { IKoerpergewicht } from '../Konfiguration/Gewicht';

export interface ISportler {
    ID: number;
    Geburtstag: Date;
    FertigeSessions: Array<ISession>;
    AnstehendeSessions: Array<ISession>;
    Koerpergewicht: Array<number>;
    Reset(): void;
}

export class Sportler implements ISportler {
    public ID: number;
    public Geburtstag: Date;
    public FertigeSessions: Array<ISession>;
    public AnstehendeSessions: Array<ISession>;
    public Koerpergewicht: Array<number>;

    constructor() {
        this.ID = 0;
        this.Geburtstag = null as any;
        this.Koerpergewicht = [];
        this.Reset();
    }

    public GetAnstehendeSessions(aMaxAnz: number | void): Array<ISession> {
        return [];
    }

    public GetAktuellesKoerpergewicht(): IKoerpergewicht {
        return null as any;
    }

    public Reset(): void {
        this.FertigeSessions = [];
        this.AnstehendeSessions = [];
    }
}
