import { GlobalService } from 'src/app/services/global.service';
import { Component, NgModule, OnInit } from '@angular/core';
import { FilePreviewOverlayService } from './services/file-preview-overlay.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// platformBrowserDynamic().bootstrapModule(AppModule);
// const numericNumberReg = '^(0|[1-9][0-9]*)$';
const numericNumberReg = '[0-9]';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'Top-Coach';
  public form: FormGroup;
  // name: string;
  // street: string;
  // zip: number;
  // city: string;
  
  constructor(private previewDialog: FilePreviewOverlayService, private svc: GlobalService, private fb: FormBuilder) {
  }

  public clickEventHandler() {
    // this.previewDialog.open();
  }

  public logForm(value: any) {
    console.log(value);
  }


  ngOnInit() {
    // this.form = this.fb.group({
    //   controllname: ['', [Validators.maxLength(5), Validators.required]],
    //   controllstreet: [' ', [Validators.maxLength(5), Validators.minLength(3)]],
    //   controllcity: ['', [Validators.maxLength(5), Validators.pattern(numericNumberReg)]],
    //   controllzip: ['', [Validators.maxLength(5), Validators.pattern(numericNumberReg)]]
    // });
  }
}
