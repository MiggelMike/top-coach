import { Uebung } from './../../Business/Uebung/Uebung';
import { Hantelscheibe } from "./../../Business/Hantelscheibe/Hantelscheibe";
import { PlateCalcOverlayRef, cPlateCalcOverlayData } from "./../services/plate-calc-svc.service";
import { Component, Inject, OnInit } from "@angular/core";
import { floatMask } from "../app.module";
import { PlateCalcOverlayConfig } from "../services/plate-calc-svc.service";
import { DexieSvcService } from "../services/dexie-svc.service";
import { Satz } from "src/Business/Satz/Satz";
import { Hantel } from "src/Business/Hantel/Hantel";
import { Observable, of } from "rxjs";

@Component({
	selector: "app-plate-calc",
	templateUrl: "./plate-calc.component.html",
	styleUrls: ["./plate-calc.component.scss"],
})
export class PlateCalcComponent implements OnInit {
	public fConfig: PlateCalcOverlayConfig;
	public floatMask = floatMask;
	public PlateList: Array<Hantelscheibe>;
  public HantelListe: Array<Hantel>;
  public Hantel: Hantel;
  public Satz: Satz;
  public Uebung: Uebung;
  public PlateListObserver: Observable<Array<Hantelscheibe>>;
  public GewichtAusgefuehrt: number = 0;
  public SetForAllSets: boolean;
  public HantelForAllSets: boolean;
  
  public get SatzNr(): string{
    if ((this.Uebung) && (this.Satz)) {
      let mIndex = this.Uebung.ArbeitsSatzListe.indexOf(this.Satz);
      if (mIndex > -1)
        return ' --- Work-Set ' + (mIndex + 1).toString();

      mIndex = this.Uebung.AufwaermSatzListe.indexOf(this.Satz);
      if (mIndex > -1)
        return ' --- Warm-Up-Set ' + (mIndex + 1 ).toString();
      
      mIndex = this.Uebung.AbwaermSatzListe.indexOf(this.Satz);
      if (mIndex > -1)
        return ' --- Cool-Down-Set ' + (mIndex + 1).toString();
    }
    return '';
  }


	constructor(public overlayRef: PlateCalcOverlayRef, public fDbModule: DexieSvcService, @Inject(cPlateCalcOverlayData) public aPlateCalcOverlayConfig: PlateCalcOverlayConfig) {
    this.Satz = aPlateCalcOverlayConfig.satz;
    this.Uebung = aPlateCalcOverlayConfig.uebung;
    this.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
    this.HantelListe = this.fDbModule.LangHantelListe;
    this.Hantel = this.fDbModule.LangHantelListe.find((lh) => lh.ID === this.Satz.FkHantel);
		this.PlateListObserver = of(this.PlateList);
		this.CalcPlates();
  }
  

  public get JustTheBar(): boolean {
    if(this.Hantel === undefined)
      return false;
    return this.Hantel.Gewicht === this.GewichtAusgefuehrt;
  }

  public DoWeightAllSets(aChecked: boolean) {
    if ((this.Uebung)&&(this.Satz)&&((aChecked))) {
      this.Uebung.ArbeitsSatzListe.forEach((sz) => {
        if (sz.ID !== this.Satz.ID) {
            sz.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
        }
      });
    }
  }

  public DoHantelAllSets(aChecked: boolean) {
    if ((this.Uebung)&&(this.Satz)&&((aChecked))) {
      this.Uebung.ArbeitsSatzListe.forEach((sz) => {
        if (sz.ID !== this.Satz.ID) {
            sz.FkHantel = this.Satz.FkHantel;
        }
      });
    }
  }


  public CalcPlates(aValue?: any) {
    this.PlateListObserver.subscribe(() => {
      this.PlateList = [];
      if (this.Satz.FkHantel !== undefined) {
        this.Hantel = this.fDbModule.LangHantelListe.find((lh) => lh.ID === this.Satz.FkHantel);
        if (this.Hantel !== undefined) {
          let mWeight: number = this.Satz.GewichtAusgefuehrt - this.Hantel.Gewicht;
          if (aValue) {
            if (parseFloat(aValue)) {
              this.GewichtAusgefuehrt = aValue;
              mWeight = aValue - this.Hantel.Gewicht;
            }
            else
              return;
          }
          
          if (mWeight <= 0) return;

          this.fDbModule.LadeHantelscheiben((hs) => {
            let mRelevanteScheiben: Array<Hantelscheibe> = hs.filter((mScheibe: Hantelscheibe) => {
              return mScheibe.Durchmesser.toString() === this.Hantel.Durchmesser.toString() && parseFloat(mScheibe.Gewicht.toString()) <= mWeight / 2;
            });

            mRelevanteScheiben = mRelevanteScheiben.sort((s1, s2) => {
              if (parseFloat(s1.Gewicht.toString()) > parseFloat(s2.Gewicht.toString())) return -1;

              if (parseFloat(s1.Gewicht.toString()) < parseFloat(s2.Gewicht.toString())) return 1;

              return 0;
            });

            const mCheckedPlates: Array<Hantelscheibe> = [];
            do {
              let mTmpScheibe: Hantelscheibe = null;
              for (let index = 0; index < mRelevanteScheiben.length; index++) {
                const mScheibe: Hantelscheibe = mRelevanteScheiben[index];
                mTmpScheibe = null;
                if (mCheckedPlates.find((p) => p.ID === mScheibe.ID))
                  continue;
                do {
                  if (mScheibe.Anzahl >= 2 && mWeight - mScheibe.Gewicht * 2 >= 0) {
                    if (mTmpScheibe === null) {
                      mTmpScheibe = mScheibe.Copy();
                      mTmpScheibe.Anzahl = 0;
                    }
                    
                    mTmpScheibe.Anzahl += 2;
                    mScheibe.Anzahl -= 2;
                    mWeight -= mScheibe.Gewicht * 2;
                  } else break;
                } while (true);
                
                if (mTmpScheibe !== null) {
                  this.PlateList.push(mTmpScheibe);
                }
                
                if (mWeight <= 0) break;
              }
              
              if (mWeight > 0) {
                if (this.PlateList.length > 0) {
                  mTmpScheibe = this.PlateList.pop();
                  if (parseFloat(mTmpScheibe.Gewicht.toString()) === mWeight) {
                    mWeight += mTmpScheibe.Gewicht * mTmpScheibe.Anzahl;
                    const rlvScheibe: Hantelscheibe = mRelevanteScheiben.find((hs) => hs.ID === mTmpScheibe.ID);
                    if (rlvScheibe)
                      rlvScheibe.Anzahl += mTmpScheibe.Anzahl;
                        
                    if (this.PlateList.length > 0) {
                      const mVorletzteScheibe: Hantelscheibe = this.PlateList.pop();
                      if (mVorletzteScheibe) {
                        mWeight += mVorletzteScheibe.Gewicht * mVorletzteScheibe.Anzahl;

                        const rlvScheibe: Hantelscheibe = mRelevanteScheiben.find((hs) => hs.ID === mVorletzteScheibe.ID);
                        if (rlvScheibe)
                          rlvScheibe.Anzahl += mTmpScheibe.Anzahl;

                        mCheckedPlates.push(mVorletzteScheibe);
                      }
                    }
                  } else {
                    mWeight += mTmpScheibe.Gewicht * mTmpScheibe.Anzahl;
                    mCheckedPlates.push(mTmpScheibe);
                  }
                } else break;
              } else break;
            } while (true);
          });
        }
      }
    });
  }

	ngOnInit(): void {}

	close() {
		if (this.overlayRef != null) this.overlayRef.close();
		this.overlayRef = null;
	}

	public SetWeightVorgabe(aEvent: any) {
    this.Satz.GewichtAusgefuehrt = aEvent.target.value;
    this.DoWeightAllSets(this.SetForAllSets);
  }
  
}
