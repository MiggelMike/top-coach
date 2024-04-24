import { Component, OnInit } from '@angular/core';
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
  

	constructor(
		public  readonly selectionModel: MatRangeDateSelectionModel<Date>,
		public  readonly selectionStrategy: DefaultMatCalendarRangeStrategy<Date>
	) {
		const fiveDaysAgo = new Date();
		fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
		this.dateRange = new DateRange(fiveDaysAgo, new Date());
	}

	rangeChanged(selectedDate: Date) {
		const selection = this.selectionModel.selection,
		newSelection = this.selectionStrategy.selectionFinished(selectedDate, selection);
		this.selectionModel.updateSelection(newSelection, this);
		this.dateRange = new DateRange<Date>(newSelection.start, newSelection.end);
	}

	ngOnInit() {}
}
