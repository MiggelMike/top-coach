import { Injectable } from '@angular/core';
import { DialogComponent, DialogData } from '../dialoge/hinweis/hinweis.component';
import { MatDialogConfig, MatDialog, DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export enum DialogTyp {
    Hinweis = 'Hinweis',
    Frage = 'Frage',
    Loading = 'Loading'
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
        mDialogConfig.height = aDialogData.height;
        mDialogConfig.disableClose = true;
        mDialogConfig.autoFocus = true;
        mDialogConfig.data = aDialogData;
        mDialogConfig.hasBackdrop = false;
        this.fDialog.open(DialogComponent, mDialogConfig );
    }

    public Hinweis(aDialogData: DialogData): void {
        aDialogData.typ = DialogTyp.Hinweis;
        this.DialogBasis(aDialogData);
    }

    public JaNein(aDialogData: DialogData): void {
        aDialogData.typ = DialogTyp.Frage;
        this.DialogBasis(aDialogData);
    }

    public Loading(aDialogData: DialogData): void {
        if(aDialogData.textZeilen.length <= 0)
            aDialogData.textZeilen.push('Loading');
        
        if (aDialogData.height.trim() !== '')
            aDialogData.height = '150px';
            
        aDialogData.typ = DialogTyp.Loading;
        this.DialogBasis(aDialogData);
    }
}
