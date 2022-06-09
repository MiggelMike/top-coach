import { cSessionSelectLimit } from './../services/dexie-svc.service';
import { DexieSvcService, SessionParaDB } from 'src/app/services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { ISession } from 'src/Business/Session/Session';
import { repMask } from './../../app/app.module';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { AppData } from 'src/Business/Coach/Coach';
import { throwIfEmpty } from 'rxjs';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
	SessionListe: Array<ISession> = [];
	LadeLimit: number = 10;
	public repMask = repMask;
	public AppData: AppData;

	constructor(
		private fDbModul: DexieSvcService,
		private fLoadingDialog: DialogeService
	) {
		this.fDbModul.LadeAppData()
			.then((mAppData) => {
				this.AppData = mAppData;
				this.LadeLimit = mAppData.MaxHistorySessions;
			} );
	}

	SetLadeLimit(aEvent: any) {
		// aEvent.stopPropagation();
		this.LadeLimit = Number(aEvent.target.value);
		this.AppData.MaxHistorySessions = this.LadeLimit;
		this.fDbModul.AppDataSpeichern(this.AppData);
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
