import { Uebung } from './../../Business/Uebung/Uebung';
import { Hantelscheibe } from "./../../Business/Hantelscheibe/Hantelscheibe";
import { PlateCalcOverlayRef, cPlateCalcOverlayData } from "./../services/plate-calc-svc.service";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { PlateCalcOverlayConfig } from "../services/plate-calc-svc.service";
import { DexieSvcService } from "../services/dexie-svc.service";
import { Satz, SatzTyp } from "src/Business/Satz/Satz";
import { Hantel } from "src/Business/Hantel/Hantel";
import { Observable, of } from "rxjs";

@Component({
	selector: 'app-plate-calc',
	templateUrl: './plate-calc.component.html',
	styleUrls: ['./plate-calc.component.scss'],
})
export class PlateCalcComponent implements OnInit {
	public fConfig: PlateCalcOverlayConfig;
	public PlateList: Array<Hantelscheibe>;
	public HantelListe: Array<Hantel>;
	public Hantel: Hantel;
	public Satz: Satz;
	public Uebung: Uebung;
	public PlateListObserver: Observable<Array<Hantelscheibe>>;

	//#region GewichtAusgefuehrt
	private fGewichtAusgefuehrt: number = 0;
	get GewichtAusgefuehrt(): number{
		return Number(this.fGewichtAusgefuehrt);
	}
	set GewichtAusgefuehrt(aValue: number) {
		this.fGewichtAusgefuehrt = Number(aValue);
	}
	//#endregion


	public SetForAllSets: boolean;
	public HantelForAllSets: boolean;
	public RepRangeForAllSets: boolean;
	public DoneRepsForAllSets: boolean;

	public get SatzNr(): string {
		if (this.Uebung && this.Satz) {
			let mIndex = this.Uebung.ArbeitsSatzListe.indexOf(this.Satz);
			if (mIndex > -1) return ' --- Work-Set ' + (mIndex + 1).toString();

			mIndex = this.Uebung.AufwaermSatzListe.indexOf(this.Satz);
			if (mIndex > -1) return ' --- Warm-Up-Set ' + (mIndex + 1).toString();

			mIndex = this.Uebung.AbwaermSatzListe.indexOf(this.Satz);
			if (mIndex > -1) return ' --- Cool-Down-Set ' + (mIndex + 1).toString();
		}
		return '';
	}

	constructor(
		public overlayRef: PlateCalcOverlayRef,
		public fDbModule: DexieSvcService,
		@Inject(cPlateCalcOverlayData) public fPlateCalcOverlayConfig: PlateCalcOverlayConfig
	) {
		this.Satz = fPlateCalcOverlayConfig.satz;
		this.Uebung = fPlateCalcOverlayConfig.uebung;
		this.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
		this.HantelListe = DexieSvcService.LangHantelListe;
		this.Hantel = DexieSvcService.LangHantelListe.find((lh) => lh.ID === this.Satz.FkHantel);
		this.PlateListObserver = of(this.PlateList);
		this.CalcPlates();
	}

	public get JustTheBar(): boolean {
		if (this.Hantel === undefined) return false;
		return (this.GewichtAusgefuehrt > 0) && (this.Hantel.Gewicht === this.GewichtAusgefuehrt);
	}

	private SetsAreEqual(aSatz1: Satz, aSatz2: Satz): boolean {
		if (aSatz1.ID !== undefined && aSatz2.ID !== undefined) return aSatz1.ID === aSatz2.ID;

		return aSatz1.SatzListIndex === aSatz2.SatzListIndex;
	}

	public DoWeightAllSets(aEvent: any) {
		const mChecked = aEvent.checked;
		if (this.Uebung && this.Satz && mChecked) {
			if (this.Satz.SatzTyp === SatzTyp.Aufwaermen) {
				this.Uebung.AufwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Training) {
				this.Uebung.ArbeitsSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Abkuehlen) {
				this.Uebung.AbwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.GewichtAusgefuehrt = this.Satz.GewichtAusgefuehrt;
				});
			}
		}
	}

	public SetVonWdhVorgabe(aEvent: any) {
		this.Satz.WdhVonVorgabe = Number(aEvent.target.value);
		if (this.Satz.WdhBisVorgabe < this.Satz.WdhVonVorgabe) this.Satz.WdhBisVorgabe = this.Satz.WdhVonVorgabe;
		this.DoRepRangelAllSets(this.RepRangeForAllSets);
	}

	public SetBisWdhVorgabe(aEvent: any) {
		this.Satz.WdhBisVorgabe = Number(aEvent.target.value);
		if (this.Satz.WdhVonVorgabe > this.Satz.WdhBisVorgabe) this.Satz.WdhVonVorgabe = this.Satz.WdhBisVorgabe;
		this.DoRepRangelAllSets(this.RepRangeForAllSets);
	}

	public SetWdhAusgefuehrt(aEvent: any) {
		this.Satz.WdhAusgefuehrt = Number(aEvent.target.value);
		this.DoDoneRepsAllSets(this.DoneRepsForAllSets);
	}

	public DoHantelAllSets(aEvent: any) {
		const mChecked = aEvent.checked;
		if (this.Uebung && this.Satz && mChecked) {
			if (this.Satz.SatzTyp === SatzTyp.Aufwaermen) {
				this.Uebung.AufwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.FkHantel = this.Satz.FkHantel;
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Training) {
				this.Uebung.ArbeitsSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.FkHantel = this.Satz.FkHantel;
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Abkuehlen) {
				this.Uebung.AbwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) sz.FkHantel = this.Satz.FkHantel;
				});
			}
		}
	}

	onInitOnClick(aEvent: any) {
		aEvent.target.select();
		aEvent.stopPropagation();
	}

	public DoRepRangelAllSets(aEvent: any) {
		const mChecked = aEvent.checked;
		if (this.Uebung && this.Satz && mChecked) {
			if (this.Satz.SatzTyp === SatzTyp.Aufwaermen) {
				this.Uebung.AufwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) {
						sz.WdhVonVorgabe = this.Satz.WdhVonVorgabe;
						sz.WdhBisVorgabe = this.Satz.WdhBisVorgabe;
					}
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Training) {
				this.Uebung.ArbeitsSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) {
						sz.WdhVonVorgabe = this.Satz.WdhVonVorgabe;
						sz.WdhBisVorgabe = this.Satz.WdhBisVorgabe;
					}
				});
			}
			else if (this.Satz.SatzTyp === SatzTyp.Abkuehlen) {
				this.Uebung.AbwaermSatzListe.forEach((sz) => {
					if (this.SetsAreEqual(sz, this.Satz) === false) {
						sz.WdhVonVorgabe = this.Satz.WdhVonVorgabe;
						sz.WdhBisVorgabe = this.Satz.WdhBisVorgabe;
					}
				});
			}
		}
	}

	public DoDoneRepsAllSets($event: any) {
		const mChecked = $event.checked;
		if (this.Uebung && this.Satz && mChecked) {
		  if (this.Satz.SatzTyp === SatzTyp.Aufwaermen) {
			this.Uebung.AufwaermSatzListe.forEach((sz) => {
			  if (this.SetsAreEqual(sz, this.Satz) === false) {
				sz.WdhAusgefuehrt = this.Satz.WdhAusgefuehrt;
			  }
			});
		  }
		  else if (this.Satz.SatzTyp === SatzTyp.Training) {
			this.Uebung.ArbeitsSatzListe.forEach((sz) => {
			  if (this.SetsAreEqual(sz, this.Satz) === false) {
				sz.WdhAusgefuehrt = this.Satz.WdhAusgefuehrt;
			  }
			});
		  }
		  else if (this.Satz.SatzTyp === SatzTyp.Abkuehlen) {
			this.Uebung.AbwaermSatzListe.forEach((sz) => {
			  if (this.SetsAreEqual(sz, this.Satz) === false) {
				sz.WdhAusgefuehrt = this.Satz.WdhAusgefuehrt;
			  }
			});
		  }
			}
		}

	onClickWeightVorgabe(aEvent: any) {
		aEvent.target.select();
	}

	public CalcPlates(aValue?: any) {
		this.PlateListObserver.subscribe(() => {
			this.PlateList = [];
			if (this.Satz.FkHantel !== undefined) {
				this.Hantel = DexieSvcService.LangHantelListe.find((lh) => lh.ID === this.Satz.FkHantel);
				if (this.Hantel !== undefined) {
					let mWeight: number = this.Satz.GewichtAusgefuehrt - this.Hantel.Gewicht;
					if (aValue) {
						if (parseFloat(aValue)) {
							this.GewichtAusgefuehrt = aValue;
							mWeight = aValue - this.Hantel.Gewicht;
						} else return;
					}

					if (mWeight <= 0) return;

					this.fDbModule.LadeHantelscheiben((hs) => {
						let mRelevanteScheiben: Array<Hantelscheibe> = hs.filter((mScheibe: Hantelscheibe) => {
							return (
								mScheibe.Durchmesser.toString() === this.Hantel.Durchmesser.toString() &&
								parseFloat(mScheibe.Gewicht.toString()) <= mWeight / 2
							);
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
								if (mCheckedPlates.find((p) => p.ID === mScheibe.ID)) continue;
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
										const rlvScheibe: Hantelscheibe = mRelevanteScheiben.find(
											(hs) => hs.ID === mTmpScheibe.ID
										);
										if (rlvScheibe) rlvScheibe.Anzahl += mTmpScheibe.Anzahl;

										if (this.PlateList.length > 0) {
											const mVorletzteScheibe: Hantelscheibe = this.PlateList.pop();
											if (mVorletzteScheibe) {
												mWeight += mVorletzteScheibe.Gewicht * mVorletzteScheibe.Anzahl;

												const rlvScheibe: Hantelscheibe = mRelevanteScheiben.find(
													(hs) => hs.ID === mVorletzteScheibe.ID
												);
												if (rlvScheibe) rlvScheibe.Anzahl += mTmpScheibe.Anzahl;

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

		if (this.fPlateCalcOverlayConfig.onFormCloseFn !== undefined) {
			this.fPlateCalcOverlayConfig.onFormCloseFn(
				{
					satz: this.fPlateCalcOverlayConfig.satz,
					fertig: this.fPlateCalcOverlayConfig.satzDone,
					sess: this.fPlateCalcOverlayConfig.sess,
					uebung: this.fPlateCalcOverlayConfig.uebung,
					programm: this.fPlateCalcOverlayConfig.programm,
					dbModul: this.fPlateCalcOverlayConfig.dbModul,
					dialogService: this.fPlateCalcOverlayConfig.dialogService,
					gewichtEinheitsText: this.fPlateCalcOverlayConfig.gewichtEinheitsText,
					stoppUhrFn: this.fPlateCalcOverlayConfig.stoppUhrFn,
					stoppUhrService: this.fPlateCalcOverlayConfig.stoppUhrService,
					rowNumber: this.fPlateCalcOverlayConfig.rowNumber
				}
			);
		}
		this.overlayRef = null;
	}

	public SetWeightAusgefuehrt(aEvent: any) {
		this.Satz.GewichtAusgefuehrt = aEvent.target.value;
		this.DoWeightAllSets(this.SetForAllSets);
	}
}
