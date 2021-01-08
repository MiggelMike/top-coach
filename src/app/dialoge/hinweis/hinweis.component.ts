import { DialogTyp } from './../../services/dialoge.service';
import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface IOkCallback {
    ():void;
}

interface ICancelCallback {
    ():void;
}


export class DialogData {
    textZeilen: Array<string> = [];
    typ: DialogTyp;
    OkFn: IOkCallback;
    CancelFn: ICancelCallback;
    OkData: any;
    CancelData: any;
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
    ) { }

    onOkClick(): void {
        this.dialogRef.close();
        if (this.data.OkFn !== undefined)
            this.data.OkFn();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }
}
