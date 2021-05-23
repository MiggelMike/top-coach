import { Component, OnInit, Input } from '@angular/core';

export interface IButtonClick{
    (para?:any): Boolean;
}

@Component({
    selector: 'app-data-store-buttons',
    templateUrl: './data-store-buttons.component.html',
    styleUrls: ['./data-store-buttons.component.scss']
})
export class DataStoreButtonsComponent implements OnInit {
    @Input() SaveClick: IButtonClick = null;
    @Input() CancelClick: IButtonClick = null;
    @Input() ClickData: any = null;

    constructor() { }

    ngOnInit(): void {}
}
