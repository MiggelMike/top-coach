import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: 'app-hinweis',
    templateUrl: './hinweis.component.html',
    styleUrls: ['./hinweis.component.scss']
})

export class HinweisComponent {

    constructor(
        public dialogRef: MatDialogRef<HinweisComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onOkClick(): void {
        this.dialogRef.close();
    }
}
