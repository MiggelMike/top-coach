import { IStammUebung, StammUebung, UebungsName, UebungsTyp } from './../../Business/Uebung/Uebung_Stammdaten';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UebungService {

  public Uebungen: Array<IStammUebung> = [];

  constructor() { }

  public Kopiere(aUebung: IStammUebung): IStammUebung {
    return StammUebung.NeueStammUebung(aUebung.ID, aUebung.Name, aUebung.Typ, aUebung.Kategorieen01);
  }

  public SucheUebungPerName(aName: UebungsName): StammUebung {
    return this.Uebungen.find(u => u.Name = aName);
  }

  public ErzeugeUebungStammdaten() {
    const mKategorieen01 = [];
    const mGzclpKategorieen01 = StammUebung.ErzeugeGzclpKategorieen01();
    for (const mUeb in UebungsName) {
      if (mUeb) {
        this.Uebungen.push(StammUebung.NeueStammUebung(
          this.Uebungen.length + 1,
          mUeb,
          UebungsTyp.Kraft,
          mKategorieen01.concat(mGzclpKategorieen01)));
      }
    }
  }

}
