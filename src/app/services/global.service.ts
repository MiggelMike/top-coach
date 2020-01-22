import { Injectable } from '@angular/core';
import { Sportler, ISportler } from '../../Business/Sportler/Sportler';
import { GzclpProgramm  } from '../../Business/TrainingsProgramm/Gzclp';
import { ISession, SessionKategorie } from '../../Business/Session/Session';
import { IStammUebung, StammUebung, UebungsTyp, UebungsKategorie01, UebungsName } from '../../Business/Uebung/Uebung_Stammdaten';
import { TrainingsProgramm, ITrainingsProgramm } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { AppData } from '../../Business/Applikation';

export class GlobalService {
    public Sportler: Sportler;
    public AppData: AppData;
    public StandardVorlagen = new Array<ITrainingsProgramm>();

    constructor() {
        this.AppData = new AppData();
        this.Init();
        this.Sportler.ID = this.LadeSportler();
        if (this.Sportler.ID > 0) {
        }
    }

    Init(): void {
        this.Sportler = new Sportler();
    }

    ErzeugeStandardVorlagen(): void {
        const mGzclpProgramm = new GzclpProgramm(SessionKategorie.Vorlage);
        mGzclpProgramm.Name = 'GZCLP - Standard';
        const mSessions = new Array<ISession>();
        mGzclpProgramm.Init(mSessions);
        this.StandardVorlagen.push(mGzclpProgramm);
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

    LadeSportler(): number {
        const s = localStorage.getItem('SportlerID');
        return (s === null) || (s.length === 0) ? 0 : Number(s);
    }
}

export const GlobalData = new GlobalService();
GlobalData.ErzeugeStandardVorlagen();

