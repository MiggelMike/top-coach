enum SessionTyp {
    Gzclp_A1,
    Gzclp_B1,
    Gzclp_A2,
    Gzclp_B2,
    Custom
}

enum ProgrammTyp {
    Gzclp,
    Custom
}


interface ISession {
    ID: number;
    Name: string;
    Saetze: Array<ISatz>;
}

interface IKonkreteSession extends ISession {
    Datum: Date;
    DauerInSek: number;
    Typ: SessionTyp;
}

interface IProgrammSession extends ISession {
    ProgrammTyp: ProgrammTyp;
    Init(): void;
}

abstract class ProgrammSession implements IProgrammSession {
    ID: number;
    Name: string;
    Saetze: Array<ISatz>;
    ProgrammTyp: ProgrammTyp;
    abstract Init(): void;
}



