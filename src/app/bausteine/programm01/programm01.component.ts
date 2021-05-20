import { DexieSvcService } from './../../services/dexie-svc.service';
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "./../../services/global.service";
import { Component, OnInit, Input } from "@angular/core";
import { ITrainingsProgramm, ProgrammKategorie } from "../../../Business/TrainingsProgramm/TrainingsProgramm";
import { SessionStatus } from 'src/Business/Session/Session';

@Component({
    selector: "app-programm01",
    templateUrl: "./programm01.component.html",
    styleUrls: ["./programm01.component.scss"],
})
export class Programm01Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() programmLadeContext: boolean | false;
    @Input() showButtons: boolean | false;
    @Input() programmtext: { value: null };

    constructor(
        private fGlobalService: GlobalService,
        private fDialogeService: DialogeService,
        private fDexieService: DexieSvcService
    ) {}

    ngOnInit() { }
    
    SelectThisWorkoutClick(aProgram: ITrainingsProgramm, $event: any): void {
        $event.stopPropagation();
        this.fDexieService.LadeProgramme(ProgrammKategorie.AktuellesProgramm, aProgram);
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
