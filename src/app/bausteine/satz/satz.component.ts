import { ISession } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { floatMask, repMask } from './../../app.module';
import { ISatz } from './../../../Business/Satz/Satz';
import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-satz",
    templateUrl: "./satz.component.html",
    styleUrls: ["./satz.component.scss"],
})
export class SatzComponent implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satzTypText: string = '';
    @Input() satz: ISatz = null;
    @Input() session: ISession = null;
    @Input() satzListe: Array<ISatz>;
    
    constructor() {}

    ngOnInit(): void { }
    
}
