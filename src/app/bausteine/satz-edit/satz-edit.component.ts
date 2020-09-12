import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { IUebung_Sess } from "./../../../Business/Uebung/Uebung_Sess";
import { Component, OnInit, Input } from "@angular/core";
import { ISatz } from "./../../../Business/Satz/Satz";

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() sessUebung: IUebung_Sess;
    @Input() satz: ISatz;
    @Input() rowNum: number;
    @Input() satzTyp: string;
  
    constructor() {}

    ngOnInit(): void {}
}
