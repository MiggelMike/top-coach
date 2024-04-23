import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatRangeDateSelectionModel, DefaultMatCalendarRangeStrategy, DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';

@Component({
  selector: 'app-kalender',
  templateUrl: './kalender.component.html',
  styleUrls: ['./kalender.component.scss'],
})
export class KalenderComponent implements OnInit {
  
  dateRange: DateRange<Date>;

  constructor(
    @Inject(LOCALE_ID) private readonly selectionModel: MatRangeDateSelectionModel<Date>,
		@Inject(LOCALE_ID) private readonly selectionStrategy: DefaultMatCalendarRangeStrategy<Date>,

  ) { 

    const fiveDaysAgo = new Date();
		fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
		this.dateRange = new DateRange(fiveDaysAgo, new Date());
  }

  rangeChanged(selectedDate: Date) {
		const selection = this.selectionModel.selection,
		  newSelection = this.selectionStrategy.selectionFinished(
			selectedDate,
			selection
		  );
	
		this.selectionModel.updateSelection(newSelection, this);
		this.dateRange = new DateRange<Date>(newSelection.start, newSelection.end);
	
		// if (this.selectionModel.isComplete()) {
		//   console.log("new selection", newSelection);
		// }
	  }



  ngOnInit() {}

}
