import { Injectable } from '@angular/core';
import { HinweisComponent } from '../dialoge/hinweis/hinweis.component';
import { MatDialogConfig, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root'
})
export class DialogeService {

    name: string;
    animal: string;
    constructor(public fDialog: MatDialog) { }

    public Hinweis(aText: string): void {
        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.width = '250px';
        mDialogConfig.height = '450px';
        mDialogConfig.disableClose = true;
        mDialogConfig.autoFocus = true;

        mDialogConfig.data = {
            text: 'aText',
            name: this.name,
            animal: this.animal,
            ok: false
        };

        const dialogRef = this.fDialog.open(HinweisComponent, mDialogConfig );
        dialogRef.afterClosed().subscribe(result => {
            this.animal = result;
        });
    }
}
