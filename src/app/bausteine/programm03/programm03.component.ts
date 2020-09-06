import { ISatz } from "./../../../Business/Satz/Satz";
import { repMask, floatMask } from "./../../app.module";
import {
    Component,
    OnInit,
    Input,
} from "@angular/core";
import { ISession } from "../../../Business/Session/Session";

@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
})
export class Programm03Component implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satz: ISatz;

    @Input() session: ISession;

    ngOnInit() {}

    public SetWeight(value: number, satz: ISatz) {
        satz.GewichtVorgabe = value;
    }
}
