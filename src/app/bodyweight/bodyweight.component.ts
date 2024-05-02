import { cDateTimeFormat, DexieSvcService } from '../services/dexie-svc.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BodyWeight } from '../../Business/Bodyweight/Bodyweight';
import { Location } from "@angular/common";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DialogeService } from '../services/dialoge.service';
import { GewichtsEinheit } from 'src/Business/Coach/Coach';
import { GlobalService } from '../services/global.service';

@Component({
	selector: 'app-bodyweight',
	templateUrl: './bodyweight.component.html',
	styleUrls: ['./bodyweight.component.scss'],
})
export class BodyweightComponent implements OnInit {
	DateTimeFormat: string = cDateTimeFormat;
	BodyweightList: Array<BodyWeight> = [];
	currentBodyweight: BodyWeight = null;
	@ViewChild('calendar') calendar: ElementRef;
  
	minDate: Date = new Date();
	maxDate: Date = new Date();
	disabled: Boolean = false;
	touchUi: Boolean = true;
	enableMeridian: Boolean = true;
	disableMinute: Boolean = false;
	hideTime: Boolean = false;

	constructor(private fDbModul: DexieSvcService, public fDialogService: DialogeService, private location: Location) {
		this.fDbModul.LadeBodyweight().then((aBodyweights) => {
			aBodyweights.forEach((aBodyWeight) => {
				this.BodyweightList.push(aBodyWeight.Copy());
			});
		});
	}

	CalendarDone: boolean = false;
	ngAfterViewChecked() {
		if ((this.CalendarVisible === true) && (this.CalendarDone === false)) {
			this.CalendarDone = true;
			this.left = (window.innerWidth - this.calendar.nativeElement.clientWidth) / 2 + window.pageXOffset;
			
			if (this.mouseY - window.pageYOffset + this.calendar.nativeElement.clientHeight > window.innerHeight)
				this.top = this.mouseY - this.calendar.nativeElement.clientHeight;
			else
				this.top = this.mouseY;	
		}
	}

	get Toolbar_1_row(): boolean {
		return GlobalService.calcToolbarRrows() === 1;
	}

	get Toolbar_2_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 2;
	}

	get Toolbar_3_rows(): boolean {
		return GlobalService.calcToolbarRrows() === 3;
	}

	CalendarVisible: boolean = false;
	left: number = 50; 
	top: number = 200; 
	mouseX: number = 0;
	mouseY: number = 0;

	ToogleCalendar(aEvent:any, aCalendar:any, aBodyWeight: BodyWeight) {
		this.CalendarVisible = !this.CalendarVisible;
		if (this.CalendarVisible === true)
			this.currentBodyweight = aBodyWeight;
		else
			this.currentBodyweight = null;

		this.mouseX = aEvent.clientX;
		this.mouseY = aEvent.layerY;
		this.CalendarDone = !this.CalendarVisible;
	}

	CloseCalendar() {
		this.CalendarVisible = false;
	}

	SetDatum(aBodyWeight: BodyWeight, aEvent: any) {
		aBodyWeight.Datum = aEvent.target.value;
	}

	TakeCalendarDate(aPara:any) {
		if (this.currentBodyweight !== null)
			this.currentBodyweight.Datum = aPara.fromDate;
		this.CloseCalendar();	
	}

	get GewichtsEinheit(): string {
		if (DexieSvcService.GewichtsEinheit === GewichtsEinheit.KG) return ` (${GewichtsEinheit[GewichtsEinheit.KG]})`;
		return ` (${GewichtsEinheit[GewichtsEinheit.LBS]})`;
	}

	ngOnInit(): void {}

	NewBodyweight() {
		this.CalendarVisible = false;
		const mBodyweight: BodyWeight = new BodyWeight();
		mBodyweight.Datum = new Date();
		mBodyweight.GewichtsEinheit = DexieSvcService.GewichtsEinheit;
		this.BodyweightList.unshift(mBodyweight);
	}

	DeleteBodyweight(aBw: BodyWeight) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Delete Record?');
		mDialogData.ShowAbbruch = false;
		mDialogData.OkFn = (): void => {
			const mIndex = this.BodyweightList.indexOf(aBw);
			this.BodyweightList.splice(mIndex, 1);
			if (mIndex > -1) this.fDbModul.DeleteBodyweight(aBw.ID);
		};
		this.fDialogService.JaNein(mDialogData);
	}

	back() {
		this.fDbModul.BodyweightListeSpeichern(this.BodyweightList);
		this.location.back();
	}

	ngOnDestroy() {}

	SetBodyweight(aEvent: any, aBw: BodyWeight) {
		aEvent.stopPropagation();
		aBw.Weight = Number(aEvent.target.value);
	}
}

