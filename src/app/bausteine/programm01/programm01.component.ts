import { DexieSvcService, LadePara } from './../../services/dexie-svc.service';
import { GlobalService } from "./../../services/global.service";
import { Component, OnInit, Input } from "@angular/core";
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie, ProgrammTyp } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { SessionStatus } from '../../../Business/SessionDB';
import { DialogeService } from 'src/app/services/dialoge.service';
import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { Router } from '@angular/router';


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
        private fDbModul: DexieSvcService,
        public fDialogService: DialogeService,
        private router: Router
    ) {}

    ngOnInit() { }

    private SelectWorkout(aSelectedProgram: ITrainingsProgramm) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Do want to set initial weights?");
        mDialogData.OkFn = (): void => {
           this.router.navigate(["/app-initial-weight"], { state: { Program: aSelectedProgram } });
        }
        this.fDialogService.JaNein(mDialogData);

        // const mUebungen: Array<Uebung> = [];
        // aSelectedProgram.SessionListe.forEach(
        //     (s) => s.ExtractUebungen(mUebungen)
        // );
        
        // this.programm = aSelectedProgram.Copy();
        // this.programm.id = undefined;
        // this.programm.FkVorlageProgramm = aSelectedProgram.id;
        // this.programm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
        
        // if (this.programm.SessionListe) {
        //     let mZyklen = 1;
        //     if(aSelectedProgram.SessionListe.length < 10)
        //         mZyklen = 3;
            
        //     this.programm.SessionListe = [];
        //     for (let x = 0; x < mZyklen; x++) {
        //         for (let index = 0; index < aSelectedProgram.SessionListe.length; index++) {
        //             const mPrtSession = aSelectedProgram.SessionListe[index];
        //             const mNeueSession = mPrtSession.Copy(true);
        //             this.programm.SessionListe.push(mNeueSession);
        //         }
        //     }
        // }
    
        // this.fDbModul.ProgrammSpeichern(this.programm);
    }

    SelectThisWorkoutClick(aSelectedProgram: ITrainingsProgramm, $event: any): void {
        $event.stopPropagation();
        this.fDbModul.FindAktuellesProgramm(aSelectedProgram.id)
            .then((p) => {
                if (p.length > 0)
                {
                    const mDialogData = new DialogData();
                    mDialogData.textZeilen.push("The program is already chosen!");
                    mDialogData.textZeilen.push("Do want to replace it?");
                    mDialogData.OkFn = (): void => {
                        p.forEach((pr) =>
                            this.fDbModul.ProgrammTable.delete(pr.id)
                        );
                        this.SelectWorkout(aSelectedProgram);
                    }
                    this.fDialogService.JaNein(mDialogData);
                } else {
                    this.SelectWorkout(aSelectedProgram);
                    }
            });
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
