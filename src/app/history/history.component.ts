import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { Session } from 'src/Business/Session/Session';


@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	public SessionListe: Array<Session>;

	constructor(private fDbModule: DexieSvcService) {
	}
	
	ngOnInit(): void {
		this.fDbModule.LadeHistorySessions().then(
		  (aSessionListe) => this.SessionListe = aSessionListe
		);

	}
}
