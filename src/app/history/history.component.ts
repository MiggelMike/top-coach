import { cSessionSelectLimit } from './../services/dexie-svc.service';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	SessionListe: Array<ISession> = [];
	LadeLimit: number = 10;
	public repMask = repMask;

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService
	) {}

	SetLadeLimit(aEvent: any) {
		// aEvent.stopPropagation();
		this.LadeLimit = Number(aEvent.target.value);
		this.SessionListe = [];
		this.LadeSessions(0);
	}

	private LadeSessions (aOffSet: number) {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        mSessionParaDB.OffSet = aOffSet;
        mSessionParaDB.Limit = cSessionSelectLimit;
        this.fDbModul.LadeHistorySessions(mSessionParaDB)
            .then( (aSessionListe) => {
                if (aSessionListe.length > 0 && this.SessionListe.length < this.LadeLimit) {
					this.SessionListe = this.SessionListe.concat(aSessionListe);
					this.LadeSessions(this.SessionListe.length);
				}
				else this.fLoadingDialog.fDialog.closeAll(); 
            });
    }
	
	ngOnInit(): void {
		const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = false;
		this.fLoadingDialog.Loading(mDialogData);
		try {
			this.fLoadingDialog.Loading(mDialogData);
			this.LadeSessions(0);
		} catch {
			this.fLoadingDialog.fDialog.closeAll();
		}
	}
}
