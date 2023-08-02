import { cDeutschKuezel, cEnglishKuerzel } from './Sprache/Sprache';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { DexieSvcService } from './services/dexie-svc.service';

registerLocaleData(localeEn, 'en');
registerLocaleData(localeDe, 'de');

@Pipe({
  name: 'datePipe'
})
export class DatePipePipe implements PipeTransform {
  constructor(
    private fDateAdapter: DateAdapter<Date>,
    private fDbModul: DexieSvcService,
    private fTranslateService: TranslateService) {
    this.fTranslateService.addLangs(['en', 'de-DE']);
    this.fTranslateService.use('en');
   
  }

  transform(value: Date | string, format = 'mediumDate'): string | any {
    const datePipe = new DatePipe(this.fDbModul.AktuellSprache.Kuerzel || 'en');
    this.fDateAdapter.setLocale(this.fDbModul.AktuellSprache.Kuerzel);
    this.fTranslateService.use(this.fDbModul.AktuellSprache.Kuerzel);
    return datePipe.transform(value, this.fDbModul.AktuellSprache.DateFormat);
  }
}

