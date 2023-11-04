import { DiagramData } from './../bausteine/charts/charts.component';
import { cDeutschKuezel as cDeutschKuerzel, cDeutschDateInputMask, cEnglishDateInputMask } from './../Sprache/Sprache';
import { DexieSvcService, SessionParaDB, cMaxDatum, cMinDatum } from './../services/dexie-svc.service';
import { DiaDatum, DiaUebung, DiaUebungSettings } from './../../Business/Diagramm/Diagramm';
import { Component, ContentChild, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IProgramModul, ProgramModulTyp } from './../../app/app.module';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import * as _moment from 'moment';
import { ISession } from '../../Business/Session/Session';
import { Datum } from 'src/Business/Datum';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
var cloneDeep = require('lodash.clonedeep');

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, IProgramModul {
	public get SessionListe(): Array<ISession> {
		const mVonBisSessions: Array<ISession> = DexieSvcService.StaticHistorySessions.filter((sess) => { 
			return (sess.GestartedWann >= this.fromDate && sess.GestartedWann <= this.toDate)
		});
		return mVonBisSessions;
	}
	// public DiaTyp: string = 'line';
	public DiaUebungsListe: Array<DiaUebung> = [];
	public DiaUebungSettingsListe: Array<DiaUebungSettings> = [];
	public Diagramme: Array<Chart> = [];
	private CreatingChartsDialogData: DialogData = new DialogData();
	private Interval: any;
	group: FormGroup;
	public date: moment.Moment;
	public disabled = false;
	public showSpinners = true;
	public showSeconds = false;
	public touchUi = false;
	public enableMeridian = false;
	public minDate: moment.Moment;
	public maxDate: moment.Moment;
	public stepHour = 1;
	public stepMinute = 1;
	public stepSecond = 1;
	selectedChartIndex: number = 0;
	fromDate: Date = new Date();
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
	@ViewChild('matTabChart') matTabChart: MatTab;
	@ViewChild('ChartContainer') ChartContainer: any;
	@ViewChild('ChartType') ChartType: MatTabGroup;
	@Input() placeholderTime: string;

	range = new FormGroup({
		start: new FormControl(),
		end: new FormControl()
	  });
	

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService,
		@Inject(LOCALE_ID) locale: string
	) {
		this.toDate = new Date();
		this.fromDate.setDate(this.toDate.getDate() - 90);
		this.range.controls['start'].setValue(this.fromDate);
		this.range.controls['end'].setValue(this.toDate);
		this.CreatingChartsDialogData.ShowAbbruch = false;
		this.CreatingChartsDialogData.ShowOk = false;
		this.CreatingChartsDialogData.hasBackDrop = false;
		this.CreatingChartsDialogData.height = '150px';
		this.CreatingChartsDialogData.textZeilen[0] = 'Creating charts';
		this.fDbModul.LadeDiaUebungen()
			.then((mData) =>  this.DiaUebungSettingsListe = mData);
	}

	ngOnDestroy() {
	}
	
	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}
	

	get DateInputMask(): string{
		return this.fDbModul.AktuellSprache.Kuerzel === cDeutschKuerzel ? cDeutschDateInputMask : cEnglishDateInputMask;
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
	}

	ToolTip(aDia: any, aBarPoint: BarPoint): string {
		return aDia.UebungName + ' | ' + aBarPoint.name + ' | ' + aBarPoint.value;
	}

	onClose() {
		this.Draw(false);
	}

	public Draw(aDialogOn: boolean): void {
		if (this.matGroup.selectedIndex === 0)
			return;

		this.Diagramme = [];
		const mWorkChartListe: Array<ChartData> = [];
		this.DiaUebungsListe = [];
		let mUebungsNamen = [];
		const mVonDatum: Date = this.fromDate === null ? cMinDatum : this.fromDate;
		const mBisDatum: Date = this.toDate === null ? cMaxDatum : this.toDate;
		if (aDialogOn)
			this.fLoadingDialog.Loading(this.CreatingChartsDialogData);
		
		try {
			const aDiagrammData: Array<DiaDatum> = [];
			this.fDbModul.LadeDiagrammData(mVonDatum, mBisDatum, this.SessionListe, aDiagrammData);
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
				return (mFilterDiaUebung.Visible === true);
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

			let mAktiveIndex = 0;
			if (this.ChartType !== undefined) {
				mAktiveIndex = this.ChartType.selectedIndex;
				if(this.ChartType.selectedIndex === 1)
					mWorkChartListe.forEach((mChar) => mChar.ActiveDiaType = 'bar');
			}

			this.ChartData = mWorkChartListe;
			this.selectedChartIndex = mAktiveIndex;

			this.fLoadingDialog.fDialog.closeAll();
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
	}

	Load(aEvent: any) {
		aEvent.stopPropagation();
	}

	DiaTypChanged(aChartData:ChartData, aEvent: any) {
		if (aEvent.index === 0)
			aChartData.ActiveDiaType = 'line';
		else
			aChartData.ActiveDiaType = 'bar';
	}

	isLeapYear(year:number):boolean {
		return new Date(year, 1, 29).getDate() === 29;
	}

	
	FromDateChanged(aEvent: any) {
		aEvent.stopPropagation();
		this.fromDate = new Date(aEvent.target.value);
		this.Draw(false);
	}

	ToDateChanged(aEvent: any) {
		aEvent.stopPropagation();
		this.toDate = Datum.StaticParseDatum(aEvent.target.value, this.toDate);
		this.Draw(false);
	}

	CheckDatum(aEvent: any) {
		const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = true;
		mDialogData.hasBackDrop = false;
		mDialogData.OkFn = () => {this.fLoadingDialog.fDialog.closeAll() }

		let s: string = aEvent.target.value;
		if (s.trim() === "")
			return;
		
		let mDelimiter = '/';
		let mMonthColumnIndex = 0;	
		let mDayColumnIndex = 1;	
		if (this.fDbModul.AktuellSprache.Kuerzel === cDeutschKuerzel) {
			mDelimiter = '.';
			mMonthColumnIndex = 1;	
			mDayColumnIndex = 0;	
		}

		const mSplittedDateText: Array<string>  = s.split(mDelimiter);
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

		const mMonth = Number(mSplittedDateText[mMonthColumnIndex]);
		if (isNaN(mMonth)||(mMonth > 12)||(mMonth < 1) ) {
			mDialogData.textZeilen[0] = mSplittedDateText[mMonthColumnIndex] + ' is no valid month';
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

		const mDay = Number(mSplittedDateText[mDayColumnIndex]);
		if (isNaN(mDay)||(mDay < 1)||(mDay > mDayInMonth)) {
			mDialogData.textZeilen[0] = mSplittedDateText[mDayColumnIndex] + ' is no valid day';
			this.fLoadingDialog.Hinweis(mDialogData);
		}
	}

	async DoDia() {
		this.Draw(false);
	}

	onTabChanged(event:any) {
		if (event.index === 1) {
			if (this.Interval !== undefined) {
				clearInterval(this.Interval);
				this.Interval = undefined;
			}
			this.Draw(false);
			this.CalcChartSize();
		}//if
	}
	
	onResize(event:any) {
		this.CalcChartSize();
	}
	
	CalcChartSize() {
		if (this.ChartContainer.nativeElement.clientWidth != undefined)
			this.chartWidth = this.ChartContainer.nativeElement.clientWidth - 48;
	}

	ngOnInit(): void {
	}
}

class LineChartData {
	name: string = '';
	series: Array<any> = [];
}


class Chart {
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
