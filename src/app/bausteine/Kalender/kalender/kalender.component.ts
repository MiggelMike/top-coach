import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatRangeDateSelectionModel, DefaultMatCalendarRangeStrategy, DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { DateFormatTyp, Datum } from 'src/Business/Datum';

@Component({
	selector: 'app-kalender',
	templateUrl: './kalender.component.html',
	styleUrls: ['./kalender.component.scss'],
	// providers: [
	//   {
	//     provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
	//     useClass: DefaultMatCalendarRangeStrategy
	//   },
	//   DefaultMatCalendarRangeStrategy,
	//   MatRangeDateSelectionModel
	// ]
})
export class KalenderComponent implements OnInit {
	dateRange: DateRange<Date>;
	@Input() fromDate: Date = null;
	@Input() toDate: Date = null;
	@Input() fromDateVisible: boolean = false;
	@Input() toDateVisible: boolean = false;
	@Input() OkButtonVisible: boolean = false;
	@Output() OkFn = new EventEmitter<any>();

	
  get von(): string {
    if (this.dateRange.start === null)
      return '?';
    return Datum.StaticFormatDate(this.dateRange.start, DateFormatTyp.Datum);
  }
  
  get bis(): string {
    if (this.dateRange.end === null)
      return '?';
    return Datum.StaticFormatDate(this.dateRange.end, DateFormatTyp.Datum);
  }
	
	Ok() {
		if (this.OkFn != undefined)
			this.OkFn.emit(
				{
					fromDate: this.dateRange.start,
					toDate: this.dateRange.end
				});
}
	constructor(
		public  readonly selectionModel: MatRangeDateSelectionModel<Date>,
		public  readonly selectionStrategy: DefaultMatCalendarRangeStrategy<Date>
	) {
		const mToday = new Date()
		
		if (this.fromDate === null)
			this.fromDate = mToday;

		if (this.toDate === null)
			this.toDate = mToday;

    	this.dateRange = new DateRange(this.fromDate, this.toDate);
	}

	rangeChanged(aSelectedDate: Date) {
		if ((this.fromDateVisible === true) && (this.toDateVisible === true)) {
			const selection = this.selectionModel.selection,
				newSelection = this.selectionStrategy.selectionFinished(aSelectedDate, selection);
			this.selectionModel.updateSelection(newSelection, this);
			this.dateRange = new DateRange<Date>(newSelection.start, newSelection.end);
		}
		else this.dateRange = new DateRange(aSelectedDate,aSelectedDate);
	}

	ngOnInit() {}
}
