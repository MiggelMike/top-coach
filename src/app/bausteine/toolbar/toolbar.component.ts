import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

interface INavCheck {
    (aNavPath: string, aPara?:any): void;
}

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    @Input() NavCheckFn: INavCheck = null;
    @Input() Data: any = null;
    public isVisible: boolean = true;


    constructor(private router: Router) { }

    ngOnInit(): void {
    }
    
    NavHome() {
        this.router.navigate(['']);
    }

    NavProgrammWaehlen() {
        this.router.navigate(['/programmwaehlen']);
    }
    
    NavSettings() {
        this.router.navigate(['/settings']);
    }

}
