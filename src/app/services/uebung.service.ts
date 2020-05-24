import { Injectable } from '@angular/core';
import { serialize, deserialize, JsonProperty, IJsonObject } from '@peerlancers/json-serialization';
import { IStammUebung, StammUebung, UebungsName, UebungsTyp } from './../../Business/Uebung/Uebung_Stammdaten';

@Injectable({
  providedIn: 'root'
})
export class UebungService {
  public readonly cStammUebungen: string = 'StammUebungen';
  public readonly cLetzteUebungID: string = 'LetzteUebungID';
  @JsonProperty()
  public Uebungen: Array<IStammUebung> = [];
  @JsonProperty()
  public LetzteUebungID: number = 0;

  constructor() {
  }

  public Kopiere(aUebung: IStammUebung): IStammUebung {
    return StammUebung.NeueStammUebung(aUebung.ID, aUebung.Name, aUebung.Typ, aUebung.Kategorieen01);
  }

  public LadeLetzteID(): number {
    const s = localStorage.getItem(this.cLetzteUebungID);
    this.LetzteUebungID = (s === null) ? 0 : parseInt(s);
    return this.LetzteUebungID;
  }

  public SpeicherLetzteID() {
    localStorage.setItem(this.cLetzteUebungID, this.LetzteUebungID.toString());
  }

  public SucheUebungPerName(aName: UebungsName): StammUebung {
    const mUebung = this.Uebungen.find(u => u.Name === aName);
    return mUebung === undefined ? null : mUebung;
  }

  public LadeStammUebungen(): Array<IStammUebung> {
    const s = localStorage.getItem(this.cStammUebungen);
    if (s === null)
      return null;
    const mObject = JSON.parse(s);
    let mResult = Object.values(mObject);
    return mResult as Array<IStammUebung>;
  }

  public SpeicherStammUebungen(): void {
    const s = serialize(this.Uebungen);
    localStorage.setItem(this.cStammUebungen, JSON.stringify(s));
  }

  public ErzeugeUebungStammdaten() {
    const mKategorieen01 = [];
    const mGzclpKategorieen01 = StammUebung.ErzeugeGzclpKategorieen01();
    const mDummy = this.LadeStammUebungen();
    this.LadeLetzteID();
    try {
      if (mDummy !== null)
        this.Uebungen = mDummy;
      for (const mUeb in UebungsName) {
        if (mUeb) {
          let mUebung = this.SucheUebungPerName(mUeb as UebungsName);
          if (mUebung === null) {
            mUebung = StammUebung.NeueStammUebung(
              ++this.LetzteUebungID,
              mUeb,
              UebungsTyp.Kraft,
              mKategorieen01.concat(mGzclpKategorieen01)
            );
            this.AddUebung(mUebung);
          }
        }
      }
      this.SpeicherStammUebungen();
    } finally {
      this.SpeicherLetzteID();
    }
  }

  public AddUebung(aUebung: IStammUebung) {
    this.Uebungen.push(aUebung);
  }

}
