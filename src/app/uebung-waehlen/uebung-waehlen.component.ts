import { Session } from 'src/Business/Session/Session';
import { Uebung  } from './../../Business/Uebung/Uebung';
import { Component, OnInit, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

type UebungWaehlenDelegate = (aUebung: Uebung) => void;

export class UebungWaehlenData {
    fUebungsListe: Array<Uebung>;
    fSession: Session;
    RowClickFn: UebungWaehlenDelegate;
    fMatDialog: MatDialogRef<UebungWaehlenComponent>;
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
