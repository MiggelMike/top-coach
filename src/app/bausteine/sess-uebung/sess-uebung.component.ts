import { IUebung_Sess } from './../../../Business/Uebung/Uebung_Sess';
import { ISession } from './../../../Business/Session/Session';
import { floatMask, repMask } from './../../app.module';
import { ISatz } from './../../../Business/Satz/Satz';
import { Component, OnInit, Input } from "@angular/core";


@Component({
  selector: 'app-sess-uebung',
  templateUrl: './sess-uebung.component.html',
  styleUrls: ['./sess-uebung.component.scss']
})
export class SessUebungComponent implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    @Input() satzTypText: string = '';
    @Input() satz: ISatz = null;
    @Input() session: ISession = null;
    @Input() sessUebung: IUebung_Sess;
    @Input() satzListe: Array<ISatz>;

  constructor() { }

    ngOnInit(): void {
  }

}
