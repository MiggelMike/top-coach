import { Session } from 'src/Business/Session/Session';
import { Uebung  } from './../../Business/Uebung/Uebung';
import { Component, OnInit, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UebungService } from "src/app/services/uebung.service"
import { EditExerciseComponent } from '../edit-exercise/edit-exercise.component';


type UebungWaehlenDelegate = (aUebungWaehlenData: UebungWaehlenData ) => void;

export class UebungWaehlenData {
    fUebungsListe: Array<Uebung>;
    fSession: Session;
    OkClickFn: UebungWaehlenDelegate;
    fMatDialog: MatDialogRef<UebungWaehlenComponent>;
}


@Component({
    selector: "app-uebung-waehlen",
    templateUrl: "./uebung-waehlen.component.html",
    styleUrls: ["./uebung-waehlen.component.scss"],
})
    
export class UebungWaehlenComponent implements OnInit {

    constructor(
        private fUebungService: UebungService,
        public dialogEditRef: MatDialogRef<EditExerciseComponent>,
        public dialogRef: MatDialogRef<UebungWaehlenComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UebungWaehlenData
    ) {
    }

    ngOnInit(): void { 
    }

    public OkButtonClick() {
       this.data.OkClickFn(this.data);
    }

    public CancelClickFn() {
        this.dialogRef.close();
    };


    public EditButtonClick(aUebung: Uebung, aUebungListe: Array<Uebung>) {
        this.fUebungService.EditUebung(
            aUebung,
            aUebungListe
 		);
    }

    public NewButtonClick(aUebungListe: Array<Uebung>) {
        this.fUebungService.EditUebung(
            new Uebung(),
            aUebungListe
 		);
    }
}
