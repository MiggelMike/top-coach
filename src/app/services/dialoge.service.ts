import { Injectable } from '@angular/core';
import { DialogComponent, DialogData } from '../dialoge/hinweis/hinweis.component';
import { MatDialogConfig, MatDialog, DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export enum DialogTyp {
    Hinweis = 'Hinweis',
    Frage = 'Frage'
}


@Injectable({
    providedIn: 'root'
})
export class DialogeService {

    constructor(public fDialog: MatDialog) {
     }

    private DialogBasis(aDialogData: DialogData): void {
        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.width = 'auto';
        mDialogConfig.height = '280px';
        mDialogConfig.disableClose = true;
        mDialogConfig.autoFocus = true;
        mDialogConfig.data = aDialogData;
        mDialogConfig.hasBackdrop = false;
        

        const dialogRef = this.fDialog.open(DialogComponent, mDialogConfig );
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    public Hinweis(aDialogData: DialogData): void {
        aDialogData.typ = DialogTyp.Hinweis;
        this.DialogBasis(aDialogData);
    }

    public JaNein(aDialogData: DialogData): void {
        aDialogData.typ = DialogTyp.Frage;
        this.DialogBasis(aDialogData);
    }
}
