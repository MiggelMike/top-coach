import { Uebung } from './../../Business/Uebung/Uebung';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class UebungWaehlenData {
    UebungsListe: Array<Uebung>;
    RowClickFn: any;
}


@Component({
    selector: "app-uebung-waehlen",
    templateUrl: "./uebung-waehlen.component.html",
    styleUrls: ["./uebung-waehlen.component.scss"],
})
    
export class UebungWaehlenComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<UebungWaehlenComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UebungWaehlenData
    ) { }

    ngOnInit(): void { 
    }
}
