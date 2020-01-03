import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
// import { VirtualTimeScheduler } from 'rxjs';

export class Applikation {
    public Sportler: Sportler;

    constructor() {
        this.Init();
    }

    Init(): void {
        this.Sportler = new Sportler();
    }

    ProgrammWaehlen(): void {
        const mInfo: Array<string> = [];
        if (this.PruefungVorProgrammWahl(mInfo)) {
            this.Sportler.Reset();
        }

    }

    PruefungVorProgrammWahl(aInfo: Array<string>): boolean {
        return true;
    }

    LadeSportler(): boolean {
        return false;
    }
}
