import { Component, OnInit, Input } from '@angular/core';
import { ISession } from '../../../Business/Session/Session';

@Component({
    selector: 'app-programm03',
    templateUrl: './programm03.component.html',
    styleUrls: ['./programm03.component.scss'],
    
})
export class Programm03Component implements OnInit {
    
    @Input() session: ISession;
    constructor() { }

    ngOnInit() {
    }

}
