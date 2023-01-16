import { DiaUebungSettings } from './../../Business/Diagramm/Diagramm';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, ContentChild, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { AppData } from 'src/Business/Coach/Coach';
import { DiaUebung, DiaDatum } from 'src/Business/Diagramm/Diagramm';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';



@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	SessionListe: Array<ISession> = [];
	LadeLimit: number = 10;
	public repMask = repMask;
	public AppData: AppData;
	public DiaTyp: string = 'line';
	public DiaUebungsListe: Array<DiaUebung> = [];
	public DiaUebungSettingsListe: Array<DiaUebungSettings> = [];
	public Diagramme: Array<Chart> = [];
	chartWidth: number = 0;
	chartHeight: number = 0;
	ChartData: Array<ChartHelper> = [];
	@ContentChild('legendEntryTemplate') legendEntryTemplate: TemplateRef<any>;


	@ViewChild('LineChart') LineChart: any;
	@ViewChild('ExercisesInChart') ExercisesInChart: any;
	@ViewChild('matGroup') matGroup: any;
	@ViewChild('matTabChart') matTabChart: any;
	@ViewChild('ChartContainer') ChartContainer: any;

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService
	) {
		this.fDbModul
			.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
				this.LadeSessions(0);
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

	ToolTip(aDia: any, aBarPoint: BarPoint ):string {
		const x = aDia;
		return aDia.name  + ' | ' + aBarPoint.name + ' | ' + aBarPoint.value;
	}

	public Draw(aDiaTyp: any): void {
		const that = this;
		this.Diagramme = [];
		this.ChartData = [];
		let mData = [];
		
		this.DiaUebungsListe = [];
		let mUebungsNamen = [];

		this.fDbModul.LadeDiagrammData(this.fDbModul.DiagrammDatenListe, 20).then(() => {
			for (let index = 0; index < this.fDbModul.DiagrammDatenListe.length; index++) {
				const mPtrDiaDatum: DiaDatum = this.fDbModul.DiagrammDatenListe[index];
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
					if (mPtrDiaUebung.ID === undefined)
						this.fDbModul.InsertEineDiaUebung(mPtrDiaUebung)
							.then((aID) => mPtrDiaUebung.ID = aID);
				
					this.DiaUebungSettingsListe.push(mPtrDiaUebung);
				}

				if (mPtrDiaUebung.Visible === true) {
					mPtrDiaUebung.Relevant = false;
					// Jedes Datum aus der Liste prüfen
					this.fDbModul.DiagrammDatenListe.forEach((mPtrDiaDatum) => {
						let mMaxWeight: number = 0;
						// In der Übungsliste des Datums nach der Übung suchen 
						mPtrDiaDatum.DiaUebungsListe.forEach((mPtrDatumUebung) => {
							// Ist die Übung gleich der zu prüfenden Übung und ist MaxWeight größer als das bisher ermittelte mMaxWeight? 
							if (mPtrDatumUebung.Visible === true && mPtrDatumUebung.UebungID === mPtrDiaUebung.UebungID && mPtrDatumUebung.MaxWeight > mMaxWeight) {
								mMaxWeight = mPtrDatumUebung.MaxWeight;
								if (mMaxWeight > 0) {
									mPtrDiaUebung.Relevant = true;
									let mSeriesPoint: any;
									// Die verschiedenen Chart-Typen prüfen.
									switch (aDiaTyp) {
										case 'line': {
											let mLineData = mData.find((mData) => {
												return (mData.name === mPtrDiaUebung.UebungName);
											});

											if (mLineData === undefined) {
												mLineData = { name: mPtrDiaUebung.UebungName, series: [] };
												mData.push(mLineData);
												that.ChartData.push(mLineData);
											}

											mSeriesPoint = mLineData.series.find((mSuchPoint) => {
												return (mSuchPoint.name === mPtrDiaDatum.Datum.toDateString())
											});
                                  
											if (mSeriesPoint === undefined) {
												mSeriesPoint = { name: mPtrDiaDatum.Datum.toDateString(), value: 0 };
												mLineData.series.push(mSeriesPoint);
											}

											if (mLineData.series.find((mSuch) => {
												return (mSuch.value > mMaxWeight && mSuch.name === mPtrDiaDatum.Datum.toDateString());
											}) === undefined) {
												mSeriesPoint.value = mMaxWeight;
											}
											break;
										} // <-- case line
										case 'bar': {
											let mBarPoint: BarPoint;
											let mBarData: ChartHelper = mData.find((mData) => {
												return (mData.name === mPtrDiaUebung.UebungName);
											}) as ChartHelper;

											if (mBarData === undefined) {
												mBarData = new ChartHelper();
												mBarData.name = mPtrDiaUebung.UebungName;
												mData.push(mBarData);
												this.ChartData.push(mBarData);
											}

											mBarPoint = mBarData.series.find((mSeriesPoint) => {
												return (mSeriesPoint.name === mPtrDiaDatum.Datum.toDateString())
											});
										
											if (mBarPoint === undefined) {
												mBarPoint = new BarPoint();
												mBarPoint.name = mPtrDiaDatum.Datum.toDateString();
												mBarPoint.value = 0;
												mBarData.series.push(mBarPoint);
												mBarData.colors.push({ "name": mBarPoint.name, "value": "#63B8FF" });
											}

											if (mBarData.series.find((mSuch) => {
												return (mSuch.value > mMaxWeight && mSuch.name === mPtrDiaDatum.Datum.toDateString());
											}) === undefined) {
												mBarPoint.value = mMaxWeight;
											}
											break;
										} // bar
									}//switch
								} // if
							}
						});
					}); // forEach -> Datum
				}
			});
		});
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

	DiaTypChanged(aEvent: any, aDiaTyp: string) {
		if (aEvent.source.checked) {
			this.DiaTyp = aDiaTyp;
			this.Draw(aDiaTyp);
		}
	}

	private LadeSessions(aOffSet: number) {
        const mDialogData = new DialogData();
        mDialogData.ShowAbbruch = false;
        mDialogData.ShowOk = false;
        mDialogData.hasBackDrop = false;
		mDialogData.height = '150px';
		mDialogData.textZeilen[0] = 'Loading history';
		this.fLoadingDialog.Loading(mDialogData);
		try {
			const mSessionParaDB: SessionParaDB = new SessionParaDB();
			mSessionParaDB.UebungenBeachten = false;
			mSessionParaDB.Limit = this.LadeLimit;
			this.fDbModul.LadeHistorySessions(mSessionParaDB)
				.then((aSessionListe) => {
					this.SessionListe = aSessionListe;
					this.fLoadingDialog.fDialog.closeAll();
				});
		} catch (err) {
			this.fLoadingDialog.fDialog.closeAll();
		}
	}

	async DoDia() {
		if (this.fDbModul.MustLoadDiagramData === true)
			await this.fDbModul.LadeDiagrammData(this.fDbModul.DiagrammDatenListe, this.AppData.MaxHistorySessions);
	
		this.fDbModul.LadeDiaUebungen().then((mDiaUebungen => {
			this.DiaUebungSettingsListe = mDiaUebungen;
			this.Draw(this.DiaTyp);
		}));
	}

	onTabChanged(event) {
		this.CalcChartSize();
	}
	
	onResize(event) {
		this.CalcChartSize();
	}
	
	CalcChartSize() {
		if (this.ChartContainer.nativeElement.clientWidth != undefined)
			this.chartWidth = this. ChartContainer.nativeElement.clientWidth;
	}

	ngOnInit(): void {
		this.DiaTyp = 'line';
		setTimeout( () => this.DoDia(), 1000);
	}
}

class Chart {
	// UebungName: string = '';
	ChartData: Array<Object> = [];
}

class BarPoint {
	name: string;
	value: any;
	// extra: { code: any } = null;
}

class ChartHelper {
	name: string;
	series: Array<BarPoint> = [];
	colors: Array<object> = [];
}