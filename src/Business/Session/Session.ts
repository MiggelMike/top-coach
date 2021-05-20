import { Uebung, UebungsKategorie02 } from 'src/Business/Uebung/Uebung';
var cloneDeep = require('lodash.clonedeep');

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
    Wartet,
    Pause,
    Laueft,
    Fertig
}

export interface ISession {
    ID: number;
    FK_Programm: number;
    SessionNr: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Kategorie02: SessionStatus;
    Bearbeitbar: Boolean;
    UebungsListe: Array<Uebung>;
    LiftedWeight: number;
    Copy(): Session;
    addUebung(aUebung: Uebung);
    hasChanged(aCmpSession: ISession): Boolean;
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Session implements ISession {
    public ID: number;
    public FK_Programm: number = 0;
    public SessionNr: number;
    public Name: string;
    public Datum: Date = new Date();
    public DauerInSek: number = 0;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus = SessionStatus.Bearbeitbar;
    public Kategorie02: SessionStatus = SessionStatus.Wartet;
    public Bearbeitbar: Boolean = false;
    public UebungsListe: Array<Uebung> = [];

    public get LiftedWeight():number {
        let mResult: number = 0;
        this.UebungsListe.forEach(u => mResult + u.LiftedWeight);

        for (let index = 0; index < this.UebungsListe.length; index++) {
            const mUebung = this.UebungsListe[index];
            mResult = mResult + mUebung.LiftedWeight;
        }
        return mResult;
    }

    constructor() {
        Object.defineProperty(this, 'UebungsListe', { enumerable: false });
    }

    public Copy(): Session {
        return cloneDeep(this); 
    }

    public addUebung(aUebung: Uebung) {
        aUebung.Kategorie02 = UebungsKategorie02.Session;
        this.UebungsListe.push(aUebung);
    }

    public hasChanged(aCmpSession: ISession): Boolean {
        if (aCmpSession.ID != this.ID) return true;
        if (aCmpSession.Datum != this.Datum) return true;
        if (aCmpSession.DauerInSek != this.DauerInSek) return true;
        if (aCmpSession.FK_Programm != this.FK_Programm) return true;
        if (aCmpSession.Kategorie01 != this.Kategorie01) return true;
        if (aCmpSession.Name != this.Name) return true;
        if (aCmpSession.SessionNr != this.SessionNr) return true;    
        
        if ((aCmpSession.UebungsListe) && (this.UebungsListe)) {
            if (aCmpSession.UebungsListe.length != this.UebungsListe.length)
                return true;

            if (this.UebungsListe) {
                for (let index = 0; index < this.UebungsListe.length; index++) {
                    if (this.UebungsListe[index].hasChanged(aCmpSession.UebungsListe[index])) {
                        console.log('Exercise #' + index.toString() + ' has changed.');
                        return true;
                    }
                }
            }
        }
        return false;
    }

}
