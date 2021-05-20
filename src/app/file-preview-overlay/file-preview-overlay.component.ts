import { Session, ISession } from './../../Business/Session/Session';
import { Component, OnInit, Inject } from '@angular/core';
import { FilePreviewOverlayRef, FILE_PREVIEW_DIALOG_DATA } from '../services/file-preview-overlay.service';

@Component({
    selector: "app-file-preview-overlay",
    templateUrl: "./file-preview-overlay.component.html",
    styleUrls: ["./file-preview-overlay.component.scss"],
})
export class FilePreviewOverlayComponent implements OnInit {

    constructor( public dialogRef: FilePreviewOverlayRef, @Inject(FILE_PREVIEW_DIALOG_DATA) public sess: ISession) {
    }

    ngOnInit() {
    }

    public close() {
        this.dialogRef.close();
    }
}
