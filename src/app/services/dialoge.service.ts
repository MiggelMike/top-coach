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

    private DialogBasis(aDialogData: DialogData):MatDialogRef<DialogComponent> {
        const mDialogConfig = new MatDialogConfig();
        mDialogConfig.panelClass = "cc-Dialog";
        mDialogConfig.width = 'auto';
        mDialogConfig.height = aDialogData.height;
        mDialogConfig.disableClose = true;
        mDialogConfig.autoFocus = true;
        mDialogConfig.data = aDialogData;
        mDialogConfig.hasBackdrop = aDialogData.hasBackDrop;
        return this.fDialog.open(DialogComponent, mDialogConfig);
    }

    public Hinweis(aDialogData: DialogData): MatDialogRef<DialogComponent> {
        aDialogData.typ = DialogTyp.Hinweis;
        return this.DialogBasis(aDialogData);
    }

    public JaNein(aDialogData: DialogData): MatDialogRef<DialogComponent> {
        aDialogData.typ = DialogTyp.Frage;
        return this.DialogBasis(aDialogData);
    }

    public Loading(aDialogData: DialogData): MatDialogRef<DialogComponent> {
        if(aDialogData.textZeilen.length <= 0)
            aDialogData.textZeilen.push('Loading');
        
        if (aDialogData.height.length === 0)
            aDialogData.height = '150px';
            
        aDialogData.typ = DialogTyp.Loading;
        return this.DialogBasis(aDialogData);
    }
}
