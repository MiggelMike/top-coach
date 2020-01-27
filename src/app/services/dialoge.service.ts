import { Injectable } from '@angular/core';
import { HinweisComponent } from '../dialoge/hinweis/hinweis.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class DialogeService {

    name: string;
    animal: string;

    constructor(public fDialog: MatDialog) { }

    public Hinweis(aText: string): void {
        const dialogRef = this.fDialog.open(HinweisComponent, {
            width: '250px',
            height: '250px',
            data: {name: this.name, animal: this.animal}
        });

        const x = dialogRef.afterClosed().subscribe(result => {
            // console.log('The dialog was closed');
            this.animal = result;
        });
    }
}
