import { Component, OnInit } from '@angular/core';
import { FilePreviewOverlayService } from '../services/file-preview-overlay.service';

@Component({
  selector: 'app-file-preview-overlay',
  templateUrl: './file-preview-overlay.component.html',
  styleUrls: ['./file-preview-overlay.component.scss']
})
 
  
export class FilePreviewOverlayComponent implements OnInit {

  // constructor(private filePreviewOverlayService: FilePreviewOverlayService) { }

  ngOnInit() {
  }

  public close() {
//    this.filePreviewOverlayService.OverlayRef.dispose();
  }
}
