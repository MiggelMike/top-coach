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
    
    //#region Home
    NavHome() {
        ToolbarComponent.StaticNavHome(this.router);
    }

    static StaticNavHome(aRouter: Router) {
        ToolbarComponent.activeItem = ActiveItem.Home;
        aRouter.navigate(['']);
    }
    //#endregion

    //#region NavProgrammWaehlen
    NavProgrammWaehlen() {
        ToolbarComponent.StaticNavProgrammWaehlen(this.router)
    }

    static StaticNavProgrammWaehlen(aRouter: Router) {
        ToolbarComponent.activeItem = ActiveItem.Programmwaehlen;
        aRouter.navigate(['/programmwaehlen']);
    }

    //#endregion
    
    //#region NavSettings
    NavSettings() {
        ToolbarComponent.StaticNavSettings(this.router)
    }
    static StaticNavSettings(aRouter: Router) {
        ToolbarComponent.activeItem = ActiveItem.Settings;
        aRouter.navigate(['/settings']);
    }
    //#endregion

    //#region NavHistory
    NavHistory() {
        ToolbarComponent.activeItem = ActiveItem.History;
        this.router.navigate(['/history']);
    }
    static StaticNavHistory(aRouter: Router) {
        ToolbarComponent.activeItem = ActiveItem.History;
        aRouter.navigate(['/history']);
    }    
    //#endregion

}



  