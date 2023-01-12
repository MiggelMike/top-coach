import { Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { BubbleDataPoint, Chart, ChartConfiguration, ChartData, ChartDataset, ChartType, ChartTypeRegistry, ScatterDataPoint } from "chart.js";

export class Diagramm implements ChartConfiguration {
	visible: boolean = true;

	type: keyof ChartTypeRegistry;
	data: ChartData<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint)[], unknown>;
	
	constructor() {
		this.data = {
			labels: [],
			datasets: []
		};
	}

	public static StaticMakeDiagramm(aType: ChartType, aData: Array<any>, aTitel: string, aLables?: any): Diagramm {
		const mDiagramm: Diagramm = new Diagramm();
		mDiagramm.type = aType;
		mDiagramm.data = {
			labels: aLables,
			datasets: [{
				label: aTitel,
				data: aData,
				borderWidth: 1
			}]
		}
		return mDiagramm;
	}
}

export class DiagramData implements ChartData {
	labels?: unknown[];
	datasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint)[]>[];
	// ChartTypeRegistry: ChartTypeRegistry;
	// value: number | ScatterDataPoint | BubbleDataPoint;

}

// export class DiagramDataSet implements ChartDataset {
	// ChartTypeRegistry: ChartTypeRegistry;
	// value: number | ScatterDataPoint | BubbleDataPoint;

// }


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
  
export class ChartsComponent implements OnInit {
	private canvas: any;
  private ctx: any;
  @Input() ChartData: ChartConfiguration;
  @ViewChild('Chart') Chart: any;


  constructor() { }

  ngOnInit(): void {
  }

	ngAfterViewInit() {
		this.canvas = this.Chart.nativeElement;
		this.ctx = this.canvas.getContext("2d");
	  
		//   let chart = new Chart(this.ctx, {
		// 	type: 'radar',
		// 	data: this.ChartData,
		// 	options: {
			
		// 	}
		// });
	
	
		//   this.ChartData.data.datasets.clip =  {
		//   };
	  
		new Chart(this.ctx, this.ChartData);
		//   new Chart(this.ctx, {
		// 	  data: {
		// 		  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
		// 		  datasets: [{
		// 			  label: '# of Votes',
		// 			  data: [12, 19, 3, 5, 2, 3],
		// 			  backgroundColor: [
		// 				  'rgba(255, 99, 132, 0.2)',
		// 				  'rgba(54, 162, 235, 0.2)',
		// 				  'rgba(255, 206, 86, 0.2)',
		// 				  'rgba(75, 192, 192, 0.2)',
		// 				  'rgba(153, 102, 255, 0.2)',
		// 				  'rgba(255, 159, 64, 0.2)'
		// 			  ],
		// 			  borderColor: [
		// 				  'rgba(255, 99, 132, 1)',
		// 				  'rgba(54, 162, 235, 1)',
		// 				  'rgba(255, 206, 86, 1)',
		// 				  'rgba(75, 192, 192, 1)',
		// 				  'rgba(153, 102, 255, 1)',
		// 				  'rgba(255, 159, 64, 1)'
		// 			  ],
		// 			  borderWidth: 1
		// 		  }]
		// 	  },
		// 	  options: {
		// 		  scales: {
		// 			  y: {
		// 				  beginAtZero: true
		// 			  }
		// 		  }
		// 	  }
		//   });
		// }
	}

}
