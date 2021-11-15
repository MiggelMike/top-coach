import { GlobalService } from 'src/app/services/global.service';
import { Component, OnInit } from '@angular/core';
import { FilePreviewOverlayService } from './services/file-preview-overlay.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrainingServiceModule } from '../modules/training-service.module';
import { Observable } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter, map } from 'rxjs/operators';

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
    public state$: Observable<{ [key: string]: string }>;
  
    constructor(
        private router: Router,
        private previewDialog: FilePreviewOverlayService,
        private svc: GlobalService,
        private fb: FormBuilder,
        // private aTrainingServiceModule: TrainingServiceModule
    ) {
        const y = 0;
    // aTrainingServiceModule.setX(123);
    // console.log('>>> app component x has been set to ', aTrainingServiceModule.getX());
  }

  public clickEventHandler() {
    // this.previewDialog.open();
  }

  public logForm(value: any) {
    console.log(value);
  }


    ngOnInit() {

        this.state$ = this.router.events
        .pipe(
          filter(e => e instanceof NavigationStart),
          map(() => this.router.getCurrentNavigation().extras.state)
        );
        
    // this.form = this.fb.group({
    //   controllname: ['', [Validators.maxLength(5), Validators.required]],
    //   controllstreet: [' ', [Validators.maxLength(5), Validators.minLength(3)]],
    //   controllcity: ['', [Validators.maxLength(5), Validators.pattern(numericNumberReg)]],
    //   controllzip: ['', [Validators.maxLength(5), Validators.pattern(numericNumberReg)]]
    // });
  }
}
