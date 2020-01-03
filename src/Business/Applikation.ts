import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
// import { VirtualTimeScheduler } from 'rxjs';

export class Applikation {
    public Sportler: ISportler;

    constructor() {
        this.Init();
    }

    Init(): void {
        if (!this.LadeSportler()) {
            this.Sportler = new Sportler();
        }
    }

    ProgrammWaehlen(): void {

    }

    PruefungVorProgrammWahl(aInfo: Array<string>): boolean {
        return true;
    }

    LadeSportler(): boolean {
        return false;
    }
}
