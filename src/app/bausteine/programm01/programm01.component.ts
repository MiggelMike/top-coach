import { DexieSvcService, LadePara } from './../../services/dexie-svc.service';
import { GlobalService } from "./../../services/global.service";
import { Component, OnInit, Input } from "@angular/core";
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie, ProgrammTyp } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { SessionStatus } from '../../../Business/SessionDB';


@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() showButtons: boolean | false;
    @Input() showSaveButtons: boolean | false;
    @Input() programmtext: { value: null };

    constructor(
        private fGlobalService: GlobalService,
        private fDbModul: DexieSvcService
    ) {}

    ngOnInit() { }

    SelectThisWorkoutClick(aSelectedProgram: ITrainingsProgramm, $event: any): void {
        $event.stopPropagation();
        this.programm = aSelectedProgram.Copy();
        this.programm.id = undefined;
        this.programm.FkVorlageProgramm = aSelectedProgram.id;
        this.programm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
        
        if (this.programm.SessionListe) {
            let mZyklen = 1;
            if(aSelectedProgram.SessionListe.length < 10)
                mZyklen = 3;
            
            this.programm.SessionListe = [];
            for (let x = 0; x < mZyklen; x++) {
                for (let index = 0; index < aSelectedProgram.SessionListe.length; index++) {
                    const mPrtSession = aSelectedProgram.SessionListe[index];
                    const mNeueSession = mPrtSession.Copy();
                    mNeueSession.UebungsListe = [];
                    mNeueSession.FK_Programm = 0;
                    mNeueSession.ID = undefined;

                    for (let index1 = 0; index1 < mPrtSession.UebungsListe.length; index1++) {
                        const mPrtUebung = mPrtSession.UebungsListe[index1];
                        const mNeueUebung = mPrtUebung.Copy();
                        mNeueUebung.SatzListe = [];
                        mNeueUebung.ID = undefined;

                        for (let index2 = 0; index2 < mPrtUebung.SatzListe.length; index2++) {
                            const mPrtSatz =  mPrtUebung.SatzListe[index2];
                            const mNeuerSatz = mPrtSatz.Copy();
                            mNeuerSatz.SessionID = 0;
                            mNeuerSatz.UebungID = 0;
                            mNeuerSatz.ID = undefined;
                            mNeueUebung.SatzListe.push(mNeuerSatz);
                        }
                        mNeueSession.UebungsListe.push(mNeueUebung);

                    }
                    this.programm.SessionListe.push(mNeueSession);
                }
            }
        }


        this.fDbModul.ProgrammSpeichern(this.programm);

        // this.fDbModul.LadeProgramme(
        //     {
        //         fProgrammKategorie: ProgrammKategorie.AktuellesProgramm,

        //         OnProgrammAfterLoadFn: (mProgramm: TrainingsProgramm) => {
        //            this.fDbModul.AktuellesProgramm = mProgramm;
        //         }, // OnProgrammAfterLoadFn
                
        //         OnProgrammNoRecordFn: 
        //             (mProgramm: TrainingsProgramm) => {
        //                 const mAktuellesProgramm: ITrainingsProgramm = aSelectedProgram.Copy();
        //                 mAktuellesProgramm.id = undefined;
        //                 mAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;

        //                 if (aSelectedProgram.ProgrammKategorie === ProgrammKategorie.Vorlage)
        //                     mAktuellesProgramm.FkVorlageProgramm = aSelectedProgram.id;
        //                 else
        //                     mAktuellesProgramm.FkVorlageProgramm = aSelectedProgram.FkVorlageProgramm;
                        
        //                 this.fDbModul.AktuellesProgramm = mAktuellesProgramm;
        //                 this.fDbModul.ProgrammSpeichern(mAktuellesProgramm);
        //         } // OnProgrammNoRecordFn

        //     } as LadePara
        // );

            // (aProgramm) => {
            //     // Gibt es schon ein aktuelles Programm?
            //     if (aProgramm !== undefined)
            //         this.fDexieService.AktuellesProgramm = aProgramm;
            //     else {
            //         // Es gibt schon ein aktuelles Programm.
            //         this.fDexieService.CheckAktuellesProgram(aProgram, this.fDexieService.AktuellesProgramm);
                    //         else
                    //              // Es soll kein anderes aktuelles Programm gewaehlt werden.
                    //             return aProgramme[0];
                    //     } else {
                    //         // Es gibt kein aktuelles Programm.
                    //         // Soll ein aktuelles Programm gewaehlt werden?
                    //         if (aNeuesAktuellesProgram !== undefined)
                    //              // Es soll ein aktuelles Programm gewaehlt werden
                    //              this.CheckAktuellesProgram(aNeuesAktuellesProgram);
                    //     }
                    // this.fDexieService.AktuellesProgramm = aProgram;
                
                
           
    }

    EditThisWorkoutClick($event): void {
        $event.stopPropagation();
        this.fGlobalService.EditWorkout = this.programm;
        if (this.fGlobalService.EditWorkout.SessionListe)
            this.fGlobalService.EditWorkout.SessionListe.forEach(
                (sess) => (sess.Kategorie01 = SessionStatus.Bearbeitbar)
            );
    }
}
