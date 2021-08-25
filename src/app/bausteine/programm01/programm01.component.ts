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

    SelectThisWorkoutClick(aSelecedProgram: ITrainingsProgramm, $event: any): void {
        $event.stopPropagation();
        this.programm = aSelecedProgram;
        this.fDbModul.LadeProgramme(
            {
                fProgrammKategorie: ProgrammKategorie.AktuellesProgramm,

                OnProgrammAfterLoadFn: (mProgramm: TrainingsProgramm) => {
                    this.fDbModul.AktuellesProgramm = mProgramm;
                }, // OnProgrammAfterLoadFn
                
                OnProgrammNoRecordFn: 
                    (mProgramm: TrainingsProgramm) => {
                        const mAktuellesProgramm: ITrainingsProgramm = aSelecedProgram.Copy(); 
                        mAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
                        this.fDbModul.AktuellesProgramm = mAktuellesProgramm;
                        this.fDbModul.ProgrammSpeichern(mAktuellesProgramm, this.fDbModul);
                } // OnProgrammNoRecordFn

            } as LadePara
        );

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
