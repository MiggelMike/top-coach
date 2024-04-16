import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public static isLightTheme: boolean = false;
    constructor() {
        document.body.setAttribute(
            'data-theme',
            AppComponent.isLightTheme ? 'light' : 'dark'
        );
        const a = 0;
      
    }
}
