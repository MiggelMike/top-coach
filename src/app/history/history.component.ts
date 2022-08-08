import { DiaUebungSettings } from './../../Business/Diagramm/Diagramm';
import { Uebung } from './../../Business/Uebung/Uebung';
import { cSessionSelectLimit, UebungParaDB, WorkerAction } from './../services/dexie-svc.service';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { AppData } from 'src/Business/Coach/Coach';
import { DiagramData, Diagramm } from '../bausteine/charts/charts.component';
import { DiaUebung, DiaDatum } from 'src/Business/Diagramm/Diagramm';


@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	SessionListe: Array<ISession> = [];
	LadeLimit: number = 10;
	private canvas: any;
	private ctx: any;
	public repMask = repMask;
	public AppData: AppData;
	public Diagramme: Array<Diagramm> = [];
	private DiagramData: DiagramData;
	public DiaTyp: string = 'line';
	public DiaUebungsListe: Array<DiaUebung> = [];
	public DiaUebungSettingsListe: Array<DiaUebungSettings> = [];

	@ViewChild('LineChart') LineChart: any;

	constructor(
		private fDbModul: DexieSvcService,
	) {
		this.fDbModul.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
			});
	}

	onClickDiaUebung(aDiaUebung: DiaUebung, aChecked: boolean) {
		aDiaUebung.Visible = aChecked;
		const mDiaUebungSetting = (this.DiaUebungSettingsListe.find((mPtrDiaUebungSetting) => {
			if (mPtrDiaUebungSetting.UebungID === aDiaUebung.UebungID)
				return true;
			return false;
		}));

		if (mDiaUebungSetting !== undefined)
			mDiaUebungSetting.Visible = aChecked;
		this.Draw(this.DiaTyp);
	}
	
	public Draw(aDiaTyp: any):void {
		this.Diagramme = [];
		const mBorderWidth = 1;
		let mData = [];
		const mDiagramm: Diagramm = new Diagramm();
		mDiagramm.type = aDiaTyp;
		mDiagramm.data.labels = [];
		
		this.DiaUebungsListe = [];
		let mUebungsNamen = [];
		for (let index = 0; index < this.fDbModul.DiagrammDatenListe.length; index++) {
			const mPtrDiaDatum: DiaDatum = this.fDbModul.DiagrammDatenListe[index];
			mDiagramm.data.labels.push(mPtrDiaDatum.Datum.toDateString());
			mPtrDiaDatum.DiaUebungsListe.forEach((mPtrDiaUebung) => {
				if (mUebungsNamen.indexOf(mPtrDiaUebung.UebungName) === -1) {
					mUebungsNamen.push(mPtrDiaUebung.UebungName);
					this.DiaUebungsListe.push(mPtrDiaUebung);

					const mDiaUebungSetting = (this.DiaUebungSettingsListe.find((mPtrDiaUebungSetting) => {
						if (mPtrDiaUebungSetting.UebungID === mPtrDiaUebung.UebungID)
							return true;
						return false;
					}));
					if (mDiaUebungSetting !== undefined)
						mPtrDiaUebung.Visible = mDiaUebungSetting.Visible;
				}
			});
		} // for

		// Jede Übung prüfen 
		this.DiaUebungsListe.forEach((mPtrDiaUebung) => {
			const mDiaUebungSetting = (this.DiaUebungSettingsListe.find((mPtrDiaUebungSetting) => {
				if (mPtrDiaUebungSetting.UebungID === mPtrDiaUebung.UebungID)
					return true;
				return false;
			}));

			if (mDiaUebungSetting === undefined) {
				if(mPtrDiaUebung.ID === undefined)
					this.fDbModul.InsertEineDiaUebung(mPtrDiaUebung)
						.then((aID) => mPtrDiaUebung.ID = aID);
				
				this.DiaUebungSettingsListe.push(mPtrDiaUebung);
			}

			if (mPtrDiaUebung.Visible === true) {
				mData = [];
				mPtrDiaUebung.Relevant = false;
				// Jedes Datum aus der Liste prüfen
				this.fDbModul.DiagrammDatenListe.forEach((mPtrDiaDatum) => {
					let mMaxWeight: number = 0;
					// In der Übungsliste des Datums nach der Übung suchen 
					mPtrDiaDatum.DiaUebungsListe.forEach((mPtrDatumUebung) => {
						// Ist die Übung gleich der zu prüfenden Übung und ist MaxWeight größer als das bisher ermittelte mMaxWeight? 
						if (mPtrDatumUebung.Visible === true && mPtrDatumUebung.UebungID === mPtrDiaUebung.UebungID && mPtrDatumUebung.MaxWeight > mMaxWeight) {
							mMaxWeight = mPtrDatumUebung.MaxWeight;
							mData.push({ x: mPtrDiaDatum.Datum.toDateString(), y: mMaxWeight });
							if (mMaxWeight > 0) {
								mPtrDiaUebung.Relevant = true;
							} // if
						}
					});
			
					
				}); // forEach -> Datum

				if (mData.length > 0) {
					mDiagramm.data.datasets.push({
						label: mPtrDiaUebung.UebungName,
						data: mData,
						borderWidth: mBorderWidth
					});
				}
			}
		});
	
		this.Diagramme.push(mDiagramm);
	}

	Save() {
		this.fDbModul.InsertDiaUebungen(this.DiaUebungSettingsListe);
		this.fDbModul.LadeDiaUebungen().then((mDiaUebungen => {
			this.DiaUebungSettingsListe = mDiaUebungen;
		}));
	}

	SetLadeLimit(aEvent: any) {
		// aEvent.stopPropagation();
		this.LadeLimit = Number(aEvent.target.value);
		this.AppData.MaxHistorySessions = this.LadeLimit;
		this.fDbModul.AppDataSpeichern(this.AppData);
		this.SessionListe = [];
		this.LadeSessions(0);
	}

	OnLeaveFn() {
	}

	ngAfterViewInit() {
	}

	DiaTypChanged(aEvent: any, aDiaTyp: string) {
		if (aEvent.source.checked) {
			this.DiaTyp = aDiaTyp;
			this.Draw(aDiaTyp);
		}
	}

	private LadeSessions (aOffSet: number) {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        mSessionParaDB.OffSet = aOffSet;
		mSessionParaDB.Limit = cSessionSelectLimit;
        this.fDbModul.LadeHistorySessions(mSessionParaDB)
            .then( (aSessionListe) => {
				if (aSessionListe.length > 0 && this.SessionListe.length < this.LadeLimit) {
					aSessionListe.forEach((mSession) => {
						this.SessionListe.push(mSession);
						this.SessionListe.sort((s1, s2) => {
							return s2.Datum.valueOf() - s1.Datum.valueOf();
						});

					});
					this.LadeSessions(this.SessionListe.length);
				}
			});
	}
	
	ngOnInit(): void {

		this.DiaTyp = 'line';
		this.fDbModul.LadeDiaUebungen().then((mDiaUebungen => {
			this.DiaUebungSettingsListe = mDiaUebungen;
			this.Draw(this.DiaTyp);
		}));
		this.LadeSessions(0);
	}
}

