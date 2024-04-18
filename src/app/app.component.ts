import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public static isLightTheme: boolean = false;
    constructor() {
        AppComponent.DoTheme(false);
    }
  
    public static DoTheme(aValue: boolean) {
      AppComponent.isLightTheme = aValue;
      document.body.setAttribute(
        'data-theme',
        AppComponent.isLightTheme ? 'light' : 'dark'
    );
  }
}
