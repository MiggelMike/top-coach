import { cSessionSelectLimit } from './../services/dexie-svc.service';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { AppData } from 'src/Business/Coach/Coach';
import { Chart, ChartConfiguration, ChartDataset } from "chart.js";
import { Diagramm } from '../bausteine/charts/charts.component';


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

	@ViewChild('LineChart') LineChart: any;

	constructor(
		private fDbModul: DexieSvcService,
	) {
		this.fDbModul.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
			});
		
		// const mDiagrammData: Array<any> = [];
		// 	const mData: any = [1,2,3,4];
		// 	const mData2: any = [40,30,20,10];
			// mDiagrammData.push(mData);
			// mDiagramm.data.datasets.push(mData2);
//		const mDiagramm = Diagramm.StaticMakeDiagramm('line', mData, 'Titel', ['x', 'y', 'z']);
		const mDiagramm: Diagramm = new Diagramm();
		mDiagramm.type = 'line';
		mDiagramm.data = {
			labels: ['a','b','c','d','e',],
			datasets:  [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 3],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			},
			{
				label: '# of 2',
				data: [3, 2, 5, 19, 12, 15],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
				}
			]
		}
			
		
		
			this.Diagramme.push(mDiagramm);

			//<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint)[], unknown>;

		//  const mDiagramm2 = Diagramm.StaticMakeDiagramm('line', mData2, 'Titel', ['x', 'y', 'z']);
		//this.Diagramme.push(mDiagramm2);
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
		// this.canvas = this.LineChart.nativeElement;
		// this.ctx = this.canvas.getContext("2d");
		
		// new Chart(this.ctx, {
		// 	type: 'line',
		// 	data: {
		// 		labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
		// 		datasets: [{
		// 			label: '# of Votes',
		// 			data: [12, 19, 3, 5, 2, 3],
		// 			backgroundColor: [
		// 				'rgba(255, 99, 132, 0.2)',
		// 				'rgba(54, 162, 235, 0.2)',
		// 				'rgba(255, 206, 86, 0.2)',
		// 				'rgba(75, 192, 192, 0.2)',
		// 				'rgba(153, 102, 255, 0.2)',
		// 				'rgba(255, 159, 64, 0.2)'
		// 			],
		// 			borderColor: [
		// 				'rgba(255, 99, 132, 1)',
		// 				'rgba(54, 162, 235, 1)',
		// 				'rgba(255, 206, 86, 1)',
		// 				'rgba(75, 192, 192, 1)',
		// 				'rgba(153, 102, 255, 1)',
		// 				'rgba(255, 159, 64, 1)'
		// 			],
		// 			borderWidth: 1
		// 		}]
		// 	},
		// 	options: {
		// 		scales: {
		// 			y: {
		// 				beginAtZero: true
		// 			}
		// 		}
		// 	}
		// });
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
		this.LadeSessions(0);
	}
}
function ChartData<T, U, V>() {
	throw new Error('Function not implemented.');
}

