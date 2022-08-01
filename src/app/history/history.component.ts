import { cSessionSelectLimit, UebungParaDB } from './../services/dexie-svc.service';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { AppData } from 'src/Business/Coach/Coach';
import { DiagramData, Diagramm } from '../bausteine/charts/charts.component';
import { DiaUebung } from 'src/Business/Diagramm/Diagramm';


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
	private DiagramData: DiagramData;
	public DiaTyp: string = 'line';
	private DiaUebungsListe: Array<DiaUebung> = [];

	@ViewChild('LineChart') LineChart: any;

	constructor(
		private fDbModul: DexieSvcService,
	) {
		this.fDbModul.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
			});
		
		// backgroundColor: [
		// 	'rgba(255, 99, 132, 0.2)',
		// 	'rgba(54, 162, 235, 0.2)',
		// 	'rgba(255, 206, 86, 0.2)',
		// 	'rgba(75, 192, 192, 0.2)',
		// 	'rgba(153, 102, 255, 0.2)',
		// 	'rgba(255, 159, 64, 0.2)'
		// ],
		// borderColor: [
		// 	'rgba(255, 99, 132, 1)',
		// 	'rgba(54, 162, 235, 1)',
		// 	'rgba(255, 206, 86, 1)',
		// 	'rgba(75, 192, 192, 1)',
		// 	'rgba(153, 102, 255, 1)',
		// 	'rgba(255, 159, 64, 1)'
		// ],
		
	}

	private LadeDiaDaten(){
		
	}
	
	public Draw(aDiaTyp: any) {
		this.Diagramme = [];
		const mBorderWidth = 1;
	
		const mData: number[] = [12, 19, 3, 5, 2, 3];
		const mData2: number[] = [120, 190, 30, 50, 20, 30];
	
		const mDiagramm: Diagramm = new Diagramm();
		mDiagramm.type = aDiaTyp;
		mDiagramm.data.labels = ['a', 'b', 'c', 'd', 'e'];
		// this.fDbModul.DiagrammDatenListe.length
	
		for (let index = 0; index < 2; index++) {
			if (index === 0)
				mDiagramm.data.datasets.push({
					label: '# of Votes',
					data: mData,
					borderWidth: mBorderWidth
				});
			if (index === 1)
				mDiagramm.data.datasets.push({
					label: '# of Votes',
					data: mData2,
					borderWidth: mBorderWidth
				});
		}
		
		this.Diagramme.push(mDiagramm);
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
	}

	DiaTypChanged(aEvent: any, aDiaTyp: string) {
		if (aEvent.source.checked) 
			this.Draw(aDiaTyp);
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
		this.DiaTyp = 'line';
		this.LadeSessions(0);
	}
}

