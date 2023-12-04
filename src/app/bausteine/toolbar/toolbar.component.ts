import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Interface } from 'readline';



interface INavCheck {
    (aNavPath: string, aPara?:any): void;
}

export enum ActiveItem{
    Home = "Home",
    Settings = "Settings",
    Programmwaehlen = "Programmwaehlen",
    History = "History"
}


export interface IActiveItem{
 	get activeItem(): (typeof ActiveItem);
}

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, IActiveItem {
    @Input() NavCheckFn: INavCheck = null!;
    @Input() Data: any = null;
    public isVisible: boolean = true;
    public static activeItem: ActiveItem = ActiveItem.Home;

    constructor(private router: Router) { }

    get activeItem(): typeof ActiveItem {
        return ActiveItem;
    }

    ngOnInit(): void {
    }

    get getActiveItem():ActiveItem {
        return ToolbarComponent.activeItem;
    }
    
    NavHome() {
        ToolbarComponent.activeItem = ActiveItem.Home;
        this.router.navigate(['']);
    }

    NavProgrammWaehlen() {
        ToolbarComponent.activeItem = ActiveItem.Programmwaehlen;
        this.router.navigate(['/programmwaehlen']);
    }
    
    NavSettings() {
        ToolbarComponent.activeItem = ActiveItem.Settings;
        this.router.navigate(['/settings']);
    }

    NavHistory() {
        ToolbarComponent.activeItem = ActiveItem.History;
        this.router.navigate(['/history']);
    }


}



  