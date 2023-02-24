import { cMaxDatum, cMinDatum } from './../services/dexie-svc.service';
import { DiaUebungSettings } from './../../Business/Diagramm/Diagramm';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, ContentChild, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { AppData } from 'src/Business/Coach/Coach';
import { DiaUebung, DiaDatum } from 'src/Business/Diagramm/Diagramm';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { LineChartComponent } from '@swimlane/ngx-charts';
var cloneDeep = require('lodash.clonedeep');



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
	// public DiaTyp: string = 'line';
	public DiaUebungsListe: Array<DiaUebung> = [];
	public DiaUebungSettingsListe: Array<DiaUebungSettings> = [];
	public Diagramme: Array<Chart> = [];
	private CreatingChartsDialogData: DialogData = new DialogData();
	private Interval: any;

	fromDate: Date;
	toDate: Date = new Date();
	chartWidth: number = 0;
	chartHeight: number = 400;
	ChartData: Array<ChartData> = [];
	BarChartDataHelperList: Array<ChartData> = [];
	@ContentChild('legendEntryTemplate') legendEntryTemplate: TemplateRef<any>;
	@ViewChild('LineChart') LineChart: LineChartComponent;
	@ViewChild('BarChart') BarChart: any;
	@ViewChild('ExercisesInChart') ExercisesInChart: any;
	@ViewChild('matGroup') matGroup: any;
	@ViewChild('matTabChart') matTabChart: any;
	@ViewChild('ChartContainer') ChartContainer: any;

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService
	) {
		this.fromDate = new Date();
		this.fromDate.setDate(this.fromDate.getDate() - 90);
		this.CreatingChartsDialogData.ShowAbbruch = false;
		this.CreatingChartsDialogData.ShowOk = false;
		this.CreatingChartsDialogData.hasBackDrop = false;
		this.CreatingChartsDialogData.height = '150px';
		this.CreatingChartsDialogData.textZeilen[0] = 'Creating charts';
		

		this.fDbModul
			.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
				this.LadeSessions(0);
			});
	}

	drop(aEvent: any) {
		const mChartData: ChartData = this.ChartData[aEvent.currentIndex];
		this.ChartData[aEvent.currentIndex] = this.ChartData[aEvent.previousIndex];
		this.ChartData[aEvent.previousIndex] = mChartData;
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
		// this.Draw(true);
	}

	ToolTip(aDia: any, aBarPoint: BarPoint): string {
		return aDia.UebungName + ' | ' + aBarPoint.name + ' | ' + aBarPoint.value;
	}

	public Draw(aDialogOn: boolean): void {
		const that = this;
		this.Diagramme = [];
		const mWorkChartListe: Array<ChartData> = [];
		this.DiaUebungsListe = [];
		let mUebungsNamen = [];
		const mVonDatum: Date = this.fromDate === null ? cMinDatum : this.fromDate;
		const mBisDatum: Date = this.toDate === null ? cMaxDatum : this.toDate;
		if (aDialogOn)
			this.fLoadingDialog.Loading(this.CreatingChartsDialogData);
		
		try {
			this.fDbModul.LadeDiagrammData(mVonDatum, mBisDatum, 20).then((aDiagrammData: Array<DiaDatum>) => {
				for (let index = 0; index < aDiagrammData.length; index++) {
					const mPtrDiaDatum: DiaDatum = aDiagrammData[index];
					
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

				const mVisibleDiaUebungListe: Array<DiaUebung> = this.DiaUebungsListe.filter((mFilterDiaUebung) => {
					return ( mFilterDiaUebung.Visible === true);
				});

				const mCharTypes = ['line', 'bar'];
				for (let index = 0; index < mCharTypes.length; index++) {
					const mDiaTyp: any = mCharTypes[index];
					// Jede sichtbare Übung prüfen 
					for (let mIindexDiaUebung = 0; mIindexDiaUebung < mVisibleDiaUebungListe.length; mIindexDiaUebung++) {
						const mPtrDiaUebung = mVisibleDiaUebungListe[mIindexDiaUebung];
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

						mPtrDiaUebung.Relevant = false;
						// Jedes Datum aus der Liste prüfen
						for (let mIndexDiagrammData = 0; mIndexDiagrammData < aDiagrammData.length; mIndexDiagrammData++) {
							const mPtrDiaDatum: DiaDatum = aDiagrammData[mIndexDiagrammData];
							let mMaxWeight: number = 0;
							// In der Übungsliste des Datums nach der Übung suchen 
							// Ist die Übung gleich der zu prüfenden Übung und ist MaxWeight größer als das bisher ermittelte mMaxWeight? 
							const mPtrDatumUebung: DiaUebung = mPtrDiaDatum.DiaUebungsListe.find((mSuchDatumUebung) => {
								return (
									mSuchDatumUebung.Visible === true
									&& mSuchDatumUebung.UebungID === mPtrDiaUebung.UebungID
									&& mSuchDatumUebung.MaxWeight > mMaxWeight
								);
							});

							if (mPtrDatumUebung === undefined)
								continue;

							mMaxWeight = mPtrDatumUebung.MaxWeight;
							let mWorkChartData: ChartData = mWorkChartListe.find((mChartData) => {
								return (mChartData.UebungName === mPtrDiaUebung.UebungName);
							});
											
							if (mWorkChartData === undefined) {
								mWorkChartData = new ChartData();
								mWorkChartData.UebungName = mPtrDiaUebung.UebungName;
								mWorkChartListe.push(mWorkChartData);
							}
							mPtrDiaUebung.Relevant = true;
							let mSeriesPoint: any;
							// Die verschiedenen Chart-Typen prüfen.
							switch (mDiaTyp) {
								case 'line': {
									let mLineChartData: LineChartData = mWorkChartData.LineChartListe.find((mSuchChartData) => {
										return (mSuchChartData.name === mPtrDiaUebung.UebungName)
									});

									if (mLineChartData === undefined) {
										mLineChartData = new LineChartData();
										mLineChartData.name = mPtrDiaUebung.UebungName;
										mWorkChartData.LineChartListe.push(mLineChartData);
										mWorkChartData.colors.push({ "name": mPtrDiaUebung.UebungName, "value": "#63B8FF" });
									}

									mSeriesPoint = mLineChartData.series.find((mSuchPoint) => {
										return (mSuchPoint.name === mPtrDiaDatum.Datum.toDateString())
									});
									
									if (mSeriesPoint === undefined) {
										mSeriesPoint = { name: mPtrDiaDatum.Datum.toDateString(), value: 0 };
										mLineChartData.series.push(mSeriesPoint);
									}

									if (mLineChartData.series.find((mSuch) => {
										return (mSuch.value > mMaxWeight && mSuch.name === mPtrDiaDatum.Datum.toDateString());
									}) === undefined) {
										mSeriesPoint.value = mMaxWeight;
									}

									break;
								} // <-- case line
								case 'bar': {
									let mBarPoint: BarPoint = mWorkChartData.BarChartListe.find((mBarPoint) => {
										return (mBarPoint.name === mPtrDiaDatum.Datum.toDateString());
									});

									if (mBarPoint === undefined) {
										mBarPoint = new BarPoint();
										mBarPoint.name = mPtrDiaDatum.Datum.toDateString();
										mBarPoint.value = 0;
										mWorkChartData.colors.push({ "name": mPtrDiaDatum.Datum.toDateString(), "value": "#63B8FF" });
										mWorkChartData.BarChartListe.push(mBarPoint);
									}

									if (mWorkChartData.BarChartListe.find((mBarPoint) => {
										return (mBarPoint.value > mMaxWeight && mBarPoint.name === mPtrDiaDatum.Datum.toDateString());
									}) === undefined) {
										mBarPoint.value = mMaxWeight;
									}
									break;
								} // bar
							}//switch
						} // for
					}
				}//for
				
				this.ChartData = mWorkChartListe;
				this.fLoadingDialog.fDialog.closeAll();
			});
		} catch (error) {
			console.error(error);
			this.fLoadingDialog.fDialog.closeAll();
		}
	}

	OnBarChartExpanded(aChartHelper: ChartData) {
		let mSuchChartHelper: ChartData = this.BarChartDataHelperList.find((mBarChartHelper) => {
			return (mBarChartHelper.UebungName === aChartHelper.UebungName);
		});

		if (mSuchChartHelper === undefined) {
			mSuchChartHelper = aChartHelper.Copy();
			this.BarChartDataHelperList.push(mSuchChartHelper);
		}
		 	
		mSuchChartHelper.expanded = true;
	}

	
	OnBarChartClosed(aChartHelper: ChartData) {
		let mSuchChartHelper: ChartData = this.BarChartDataHelperList.find((mBarChartHelper) => {
			return (mBarChartHelper.UebungName === aChartHelper.UebungName);
		});

		if (mSuchChartHelper === undefined) {
			mSuchChartHelper = aChartHelper.Copy();
			this.BarChartDataHelperList.push(mSuchChartHelper);
		}
		 	
		mSuchChartHelper.expanded = false;
	}


	BarChartExpanded(aChartHelper: ChartData): boolean{
		const mSuchChartHelper: ChartData = this.BarChartDataHelperList.find((mBarChartHelper) => {
			return (mBarChartHelper.UebungName === aChartHelper.UebungName);
		});

		if (mSuchChartHelper !== undefined)
			return (mSuchChartHelper.expanded);

		return true;
	}
	
	Save() {
		this.fDbModul.InsertDiaUebungen(this.DiaUebungSettingsListe);
		// this.fDbModul.LadeDiaUebungen().then((mDiaUebungen => {
		// 	this.DiaUebungSettingsListe = mDiaUebungen;
		// }));
	}

	SetLadeLimit(aEvent: any) {
		// aEvent.stopPropagation();
		this.LadeLimit = Number(aEvent.target.value);
		this.AppData.MaxHistorySessions = this.LadeLimit;
		this.fDbModul.AppDataSpeichern(this.AppData);
		this.SessionListe = [];
		this.LadeSessions(0);
	}

	DiaTypChanged(aChartData:ChartData, aEvent: any) {
		if (aEvent.index === 0)
			aChartData.ActiveDiaType = 'line';
		else
		    aChartData.ActiveDiaType = 'bar';
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

	

	isLeapYear(year:number):boolean {
		return new Date(year, 1, 29).getDate() === 29;
	  }



	CheckDatum(aEvent: any) {
		const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = true;
		mDialogData.hasBackDrop = false;
		mDialogData.OkFn = () => {this.fLoadingDialog.fDialog.closeAll() }

		let s: string = aEvent.target.value;
		const mSplittedDateText: Array<string>  = s.split('/');
		if (mSplittedDateText.length !== 3) {
			mDialogData.textZeilen[0] = aEvent.target.value + ' is no valid date';
			this.fLoadingDialog.Hinweis(mDialogData);
			return;
		}

		const mYear = Number(mSplittedDateText[2]);
		if (isNaN(mYear)||(mYear > 2100)||(mYear < 2000)) {
			mDialogData.textZeilen[0] = mSplittedDateText[2] + ' is no valid year';
			this.fLoadingDialog.Hinweis(mDialogData);
			return;
		}

		const mMonth = Number(mSplittedDateText[0]);
		if (isNaN(mMonth)||(mMonth > 12)||(mMonth < 1) ) {
			mDialogData.textZeilen[0] = mSplittedDateText[0] + ' is no valid month';
			this.fLoadingDialog.Hinweis(mDialogData);
			return;
		}

		let mDayInMonth = 30;
		switch (mMonth) {
			case 1: case 3: case 5: case 7: case 8: case 10: case 12:
				mDayInMonth = 31;
				break;
			case 2: {
				if (this.isLeapYear(mYear))
					mDayInMonth = 29;
				else
					mDayInMonth = 28;
				break;
			}
		}//switch

		const mDay = Number(mSplittedDateText[1]);
		if (isNaN(mDay)||(mDay < 1)||(mDay > mDayInMonth)) {
			mDialogData.textZeilen[0] = mSplittedDateText[1] + ' is no valid day';
			this.fLoadingDialog.Hinweis(mDialogData);
		}
	}

	async DoDia() {
		this.fDbModul.LadeDiaUebungen().then((mDiaUebungen => {
			this.DiaUebungSettingsListe = mDiaUebungen;
			this.Draw(false);
		}));
	}

	onTabChanged(event:any) {
		if (event.index === 1) {
			if (this.Interval !== undefined) {
				clearInterval(this.Interval);
				this.Interval = undefined;
			}

			if ((this.LineChart === undefined) && (this.BarChart === undefined)) {
				this.fLoadingDialog.Loading(this.CreatingChartsDialogData);
				this.Interval = setInterval(() => {
					if ((this.LineChart !== undefined) || (this.BarChart !== undefined)) {
						clearInterval(this.Interval);
						this.Interval = undefined;
						this.fLoadingDialog.fDialog.closeAll();
					}
				}, 10);
			}//if
		}//if
		this.CalcChartSize();
	}
	
	onResize(event) {
		this.CalcChartSize();
	}
	
	CalcChartSize() {
		if (this.ChartContainer.nativeElement.clientWidth != undefined)
			this.chartWidth = this.ChartContainer.nativeElement.clientWidth - 15;
	}

	ngOnInit(): void {
		// this.DiaTyp = 'line';
		setTimeout(() => this.DoDia(), 1000);
	}
}

class LineChartData {
	name: string = '';
	series: Array<any> = [];
}


class Chart {
	// UebungName: string = '';
	ChartData: Array<Object> = [];
}

class ChartData {
	ActiveDiaType: string = 'line';
	UebungName: string = '';
	colors: Array<Object> = [];
	expanded: boolean = true;
	LineChartListe: Array<LineChartData> = [];
	BarChartListe: Array<BarPoint> = [];
	Copy():ChartData {
		return cloneDeep(this);
	}
}

class BarPoint {
	name: string = '';
	value: any;
	extra?: { code: any };
}
