export const cEnglish:string = 'English';
export const cEnglishKuerzel:string = 'en';
export const cEnglishDatumFormat:string = 'mediumDate';
export const cEnglishZeitFormat:string = 'hh:mm';
export const cEnglishDateInputMask:string = 'MM/DD/YYYY';

export const cDeutsch: string = 'Deutsch';
export const cDeutschDatumFormat:string = 'dd.MM.yyyy';
export const cDeutschZeitFormat:string = 'hh:mm';
export const cDeutschKuezel: string = 'de';
export const cDeutschDateInputMask:string = 'DD.MM.YYYY';
    
export class Sprache {
    id: number;
    Name: string;
  Kuerzel: string;
  DateFormat: string;
  TimeFormat: string;

  public static StaticNeueSprache(
    aName: string,
    aKuerzel: string,
    aDateFormat: string,
    aTimeFormat: string
  ): Sprache {
        const mNeueSprache: Sprache = new Sprache();
        mNeueSprache.Name = aName;
        mNeueSprache.Kuerzel = aKuerzel;
        mNeueSprache.DateFormat = aDateFormat;
        mNeueSprache.TimeFormat = aTimeFormat;
        return mNeueSprache;
    }
  }
  
