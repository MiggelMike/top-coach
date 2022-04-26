import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { Session } from 'src/Business/Session/Session';


@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	SessionListe: Array<Session> = [];

	constructor(private fDbModul: DexieSvcService) {
	}

	private LadeSessions (aOffSet: number) {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        mSessionParaDB.OffSet = aOffSet;
        mSessionParaDB.Limit = 5;
        this.fDbModul.LadeHistorySessions(mSessionParaDB)
            .then( (aSessionListe) => {
                if (aSessionListe.length > 0) {
					this.SessionListe = this.SessionListe.concat(aSessionListe);
					this.LadeSessions(this.SessionListe.length);
                }
            });
    }
	
	ngOnInit(): void {
		this.LadeSessions(0);
	}
}
