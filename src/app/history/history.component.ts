// import { QueryList, ViewChildren } from '@angular/core';
// import { DiagramData } from './../bausteine/charts/charts.component';
import { cDeutschKuezel as cDeutschKuerzel, cDeutschDateInputMask, cEnglishDateInputMask } from './../Sprache/Sprache';
import { DexieSvcService } from './../services/dexie-svc.service';
import { DiaDatum, DiaUebung, DiaUebungSettings } from './../../Business/Diagramm/Diagramm';
import { Component, ContentChild, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IProgramModul, ProgramModulTyp } from './../../app/app.module';
import { DialogeService } from '../services/dialoge.service';
import { DialogData, cLoadingDefaultHeight } from '../dialoge/hinweis/hinweis.component';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import * as _moment from 'moment';
import { HistorySession, ISession, Session } from '../../Business/Session/Session';
import { DateFormatTyp, Datum } from 'src/Business/Datum';
import { MatTab  } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatRadioGroup } from '@angular/material/radio';
import {ChangeDetectionStrategy } from '@angular/core';
import { DiaTyp, IDiaTyp } from 'src/Business/Coach/Coach';
// import {  MatExpansionPanelHeader, MatExpansionPanel } from '@angular/material/expansion';
// import { Session } from 'inspector';
var cloneDeep = require('lodash.clonedeep');

@Component({
	selector: 'app-history',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, IProgramModul, IDiaTyp {
	public get SessionListe(): Array<HistorySession> {
		const l = DexieSvcService.HistorySessions.filter((sess) => {
			return (sess.GestartedWann.valueOf() >= this.fromDate.valueOf() && sess.GestartedWann.valueOf() <= this.toDate.valueOf())
		});
		return l;
	}
	
	// public DiaTyp: string = 'line';
	private fDiaUebungsListe: Array<DiaUebung> = [];
	get DiaUebungsListe(): Array<DiaUebung> {
		return this.fDiaUebungsListe.sort((u1, u2) => {
			if (u1.UebungName > u2.UebungName)
				return 1;
			if (u1.UebungName < u2.UebungName)
				return -1;
			return 0;
		});
	}

	public DiaUebungSettingsListe: Array<DiaUebungSettings> = [];
	public Diagramme: Array<Chart> = [];
	private CreatingChartsDialogData: DialogData = new DialogData();
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
	ViewInitDone: boolean = false;
	//#region fromDate
	fromDate: Date;
	//#endregion
	//#region toData
	toDate: Date;
	//#endregion

	ChartData: Array<ChartData> = [];
	CmpAuswahl:number = 0;
	Auswahl: number = 0;
	BarChartDataHelperList: Array<ChartData> = [];
	aktuellerDiaTyp: DiaTyp;

	@ContentChild('legendEntryTemplate') legendEntryTemplate: TemplateRef<any>;
	@ViewChild('LineChart') LineChart: LineChartComponent;
	@ViewChild('BarChart') BarChart: any;
	@ViewChild('AuswahlRadio') AuswahlRadio: MatRadioGroup;
	@ViewChild('matTabChart') matTabChart: MatTab;
	@ViewChild('ChartContainer') ChartContainer: any;
	@ViewChild('ChartType') ChartType: MatRadioGroup;

	@Input() placeholderTime: string;

	range = new FormGroup({
		start: new FormControl(),
		end: new FormControl()
	});
	

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService,
		@Inject(LOCALE_ID) locale: string,
		private router: Router
	) {
		DexieSvcService.ModulTyp = ProgramModulTyp.History;

		this.toDate = new Date();
		this.fromDate = Datum.StaticAddDays(this.toDate, -90);

		this.range.controls['start'].setValue(this.fromDate);
		this.range.controls['end'].setValue(this.toDate);
		this.CreatingChartsDialogData.ShowAbbruch = false;
		this.CreatingChartsDialogData.ShowOk = false;
		this.CreatingChartsDialogData.hasBackDrop = false;
		this.CreatingChartsDialogData.height = '150px';
		this.CreatingChartsDialogData.textZeilen[0] = 'Creating charts';
		
		if (DexieSvcService.HistoryWirdGeladen === true) {
			const mDialogData: DialogData = new DialogData();
			mDialogData.height = cLoadingDefaultHeight;
			mDialogData.width = '200px';
			mDialogData.textZeilen.push('Loading history');
			mDialogData.ShowOk = false;
			this.fDbModul.fDialogHistoryService.Loading(mDialogData);
		}

		this.fDbModul.LadeDiaUebungen()
			.then((mData) => {
				this.DiaUebungSettingsListe = mData;
				this.Draw(true);
			});
		
		this.aktuellerDiaTyp = DexieSvcService.AppRec.DiaChartTyp;
	}

	trackDia(index, hero) {
        return hero ? hero.id : undefined;

    }

	diaTyp(): typeof DiaTyp {
		return DiaTyp;
	}


	ngOnDestroy() {
	}

	ngAfterViewInit() {
		this.ViewInitDone = true;

	}

	checkAktivDia(aDiaTyp: DiaTyp): boolean{
		return (this.aktuellerDiaTyp === aDiaTyp);
	}
	
	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}

	get DateInputMask(): string {
		return DexieSvcService.AktuellSprache.Kuerzel === cDeutschKuerzel ? cDeutschDateInputMask : cEnglishDateInputMask;
	}

	ViewSession(aEvent: Event, aSession: ISession) {
		aEvent.stopPropagation();
		this.router.navigate(["sessionFormComponent"], { state: { programm: undefined, sess: aSession, ModulTyp: ProgramModulTyp.HistoryView } });
	}
		
	GestartedWann(aSess: ISession): string {
		return Datum.StaticFormatDate(aSess.GestartedWann, DateFormatTyp.KomplettOhneSekunden);
	}

	drop(aEvent: any) {
		// DexieSvcService.CalcPosAfterDragAndDrop(this.ChartData, aEvent);
	}

	chartSettingsClick(aEvent: any) {
		aEvent.stopPropagation();
	}

	NoSessionName(aSess: HistorySession): boolean {
		return (aSess.ProgrammName === undefined || aSess.ProgrammName.trim() === '');
	}

	SessProgrammName(aSess: HistorySession): string {
		if (this.NoSessionName(aSess))
			return '?';
		return aSess.ProgrammName;
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

		this.Draw(true);
	}

	ToolTip(aDia: any, aBarPoint: BarPoint): string {
		return aDia.UebungName + ' | ' + aBarPoint.name + ' | ' + aBarPoint.value;
	}

	onClose() {
		//new Date(dateString);

		// const s1 = this.toDate.toDateString();
		// const s2 = this.fromDate.toDateString();
		// DexieSvcService.HistoryBisDatum = this.toDate;
		// DexieSvcService.HistoryVonDatum = this.fromDate;
		this.Draw(true);
	}

	ChartSettingsVisible: boolean = true;
	
	get ChartSettingsText(): string {
		if (this.ChartSettingsVisible === true)
			return 'Close history settings';
		return 'Open history settings';
	}

	CloseChartSettings() {
		this.ChartSettingsVisible = false;
		this.Save();
	}

	OpenChartSettings() {
		this.ChartSettingsVisible = !this.ChartSettingsVisible;		
	}

	public Draw(aDialogOn: boolean): void {
		// if (this.Auswahl === 0)
		// 	return;
		if (DexieSvcService.DiagrammeWerdenErstellt === true) {
			const mDialogData: DialogData = new DialogData();
			mDialogData.height = cLoadingDefaultHeight;
			mDialogData.width = '200px';
			mDialogData.textZeilen.push('Processing charts'); 
			mDialogData.ShowOk = false;
			this.fDbModul.fDialogHistoryService.Loading(mDialogData);
		}		

		if (aDialogOn)
			this.fLoadingDialog.Loading(this.CreatingChartsDialogData);

		this.Diagramme = [];
		this.ChartData = [];
		this.fDiaUebungsListe = [];
		let mUebungsNamen = [];
		
		let mVonDatum: Date = this.fromDate; // DexieSvcService.HistoryVonDatum;
		mVonDatum.setHours(0,0,0,0);

		let mBisDatum: Date = this.toDate; // DexieSvcService.HistoryBisDatum;
		mBisDatum.setHours(23,59,59,999);
		try {
			const t = DexieSvcService.DiagrammDatenListe;
			const aDiagrammData: Array<DiaDatum> = DexieSvcService.DiagrammDatenListe.filter(
				(mDiaData) => {
					return (mDiaData.Datum.valueOf() >= mVonDatum.valueOf() && mDiaData.Datum.valueOf() <= mBisDatum.valueOf());
				});
			
			//this.fDbModul.LadeDiagrammData(mVonDatum, mBisDatum, this.SessionListe, aDiagrammData);
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
				for (let mIndexDiaUebung = 0; mIndexDiaUebung < mVisibleDiaUebungListe.length; mIndexDiaUebung++) {
					const mPtrDiaUebung = mVisibleDiaUebungListe[mIndexDiaUebung];
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
						let mWorkChartData: ChartData = this.ChartData.find((mChartData) => {
							return (mChartData.UebungName === mPtrDiaUebung.UebungName);
						});
											
						if (mWorkChartData === undefined) {
							mWorkChartData = new ChartData();
							mWorkChartData.UebungName = mPtrDiaUebung.UebungName;
							mWorkChartData.ActiveDiaType = 'bar';
							this.ChartData.push(mWorkChartData);
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
									mWorkChartData.ActiveDiaType = 'line';
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

			// if (this.ChartType !== undefined) {
			// 	if(this.ChartType.value === DiaTyp.bar)
			// 		this.ChartData.forEach((mChar) => mChar.ActiveDiaType = 'bar');
				
			// }

			this.ChartData = this.ChartData.sort((c1, c2) => { 
				if (c1.UebungName > c2.UebungName) 
					return 1;
	
				if (c1.UebungName < c2.UebungName) 
					return -1;
	
				return 0;
			});
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
		DexieSvcService.AppRec.DiaChartTyp = this.aktuellerDiaTyp; 
		this.fDbModul.AppDataSpeichern(DexieSvcService.AppRec);
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
		if (DexieSvcService.AktuellSprache.Kuerzel === cDeutschKuerzel) {
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
		this.Draw(true);
	}

	ChartChanged(event: any) {
		this.aktuellerDiaTyp = event.value;
		this.Draw(true);
	}

	AuswahlChanged(event:any ) {
		this.Auswahl = event.value;
	}
	
	ngDoCheck() {
		if  (this.CmpAuswahl != this.Auswahl && this.ChartType != undefined) {
			if (this.Auswahl === 1) {
				this.ChartType.value = this.aktuellerDiaTyp;
				this.Draw(true);
			}
			this.CmpAuswahl = this.Auswahl;
			
		}
	}

	onResize(event:any) {
	}


	
	CalcChartSize(aChartContainer: any) {
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
