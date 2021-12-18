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
	public Satz: Satz;
	public PlateListObserver: Observable<Array<Hantelscheibe>>;

	constructor(public overlayRef: PlateCalcOverlayRef, public fDbModule: DexieSvcService, @Inject(cPlateCalcOverlayData) public aPlateCalcOverlayConfig: PlateCalcOverlayConfig) {
		this.Satz = aPlateCalcOverlayConfig.satz;
		this.HantelListe = this.fDbModule.LangHantelListe;
		this.PlateListObserver = of(this.PlateList);
		this.CalcPlates();
	}

	public CalcPlates(aValue?: any) {
		this.PlateListObserver.subscribe(() => {
			this.PlateList = [];
			if (this.Satz.FkHantel !== undefined) {
				const mLanhantel = this.fDbModule.LangHantelListe.find((lh) => lh.ID === this.Satz.FkHantel);
				if (mLanhantel !== undefined) {
          let mWeight: number = this.Satz.GewichtAusgefuehrt - mLanhantel.Gewicht;
          if (aValue) {
            if (parseFloat(aValue))
              mWeight = aValue - mLanhantel.Gewicht;
            else
              return;
          }
          
					if (mWeight <= 0) return;

					this.fDbModule.LadeHantelscheiben((hs) => {
						let mRelevanteScheiben: Array<Hantelscheibe> = hs.filter((mScheibe: Hantelscheibe) => {
							return mScheibe.Durchmesser.toString() === mLanhantel.Durchmesser.toString() && parseFloat(mScheibe.Gewicht.toString()) <= mWeight / 2;
						});

						mRelevanteScheiben = mRelevanteScheiben.sort((s1, s2) => {
							if (parseFloat(s1.Gewicht.toString()) > parseFloat(s2.Gewicht.toString())) return -1;

							if (parseFloat(s1.Gewicht.toString()) < parseFloat(s2.Gewicht.toString())) return 1;

							return 0;
						});

						for (let index = 0; index < mRelevanteScheiben.length; index++) {
							const mScheibe: Hantelscheibe = mRelevanteScheiben[index];
							let mTmpScheibe: Hantelscheibe = null;
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

							if (mTmpScheibe !== null) this.PlateList.push(mTmpScheibe);

							if (mWeight <= 0) break;
						}

						if (mWeight > 0) this.PlateList = [];
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
	}
}
