import { ISession } from './../../../Business/Session/Session';
import { floatMask, repMask } from './../../app.module';
import { Satz } from './../../../Business/Satz/Satz';
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
    @Input() satz: Satz = null!;
    @Input() session: ISession = null!;
    @Input() satzListe: Array<Satz>;
    
    constructor() {}

    ngOnInit(): void { }
    
}
