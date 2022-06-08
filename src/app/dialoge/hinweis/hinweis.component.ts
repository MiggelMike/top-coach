import { DialogTyp } from './../../services/dialoge.service';
import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface IOkCallback {
    (aPara?: any):void;
}

interface ICancelCallback {
    (aPara?: any):void;
}


export class DialogData {
    textZeilen: Array<string> = [];
    typ: DialogTyp;
    OkFn: IOkCallback;
    CancelFn: ICancelCallback;
    height: string = '280px';
    OkData: any;
    CancelData: any;
    ShowAbbruch: boolean = false;
    ShowOk: boolean = true;
    hasBackDrop: boolean = false;
}

@Component({
    selector: 'app-hinweis',
    templateUrl: './hinweis.component.html',
    styleUrls: ['./hinweis.component.scss']
})

export class DialogComponent {

    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        const x = data;
    }

    onOkClick(): void {
        this.dialogRef.close();
        if (this.data.OkFn !== undefined)
            this.data.OkFn(this.data.OkData);
    }

    onCancelClick(): void {
        this.dialogRef.close();
        if (this.data.CancelFn !== undefined)
            this.data.CancelFn(this.data.CancelData);
    }


    onAbbruchClick(): void {
        this.dialogRef.close();
    }
}
