import { Hantel } from './../../Business/Hantel/Hantel';
import { MuscleGroup } from './../../Business/MuscleGroup/MuscleGroup';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { Router } from '@angular/router';
import { Location } from '@angular/common'
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DialogeService } from '../services/dialoge.service';
import { Equipment, EquipmentTyp } from 'src/Business/Equipment/Equipment';
import { MatDialogRef } from '@angular/material/dialog';


type UebungEditDelegate = (aUebungWaehlenData: UebungEditData ) => void;

export class UebungEditData {
    fUebung: Uebung;
    fUebungListe: Array<Uebung>;
    OkClickFn: UebungEditDelegate;
    fMatDialog: MatDialogRef<EditExerciseComponent>;
}


@Component({
    selector: 'app-edit-exercise',
    templateUrl: './edit-exercise.component.html',
    styleUrls: ['./edit-exercise.component.scss']
})
export class EditExerciseComponent implements OnInit {
    public Uebung: Uebung = null;
    public CmpUebung: Uebung = null;
	public ClickData: EditExerciseComponent;
	public SelectFormParent: boolean = false;
	public fDialog: MatDialogRef<EditExerciseComponent>;
	public UebungEditData: UebungEditData;
	
	constructor(
		private router: Router,
		public fDexieService: DexieSvcService,
		public fDialogService: DialogeService
	) {
		const mNavigation = this.router.getCurrentNavigation();
		if (mNavigation) {
			const mState = mNavigation.extras.state as { ueb: Uebung; };
			
			this.Uebung = mState.ueb.Copy();
			this.CmpUebung = mState.ueb.Copy();
		}
	}
		
	public get EquipmentListe(): Array<string> {
		const mResult: Array<string> = Equipment.EquipmentListe();
		return mResult.sort((s1, s2) => {
			if (s1 > s2)
				return 1;
			
			if (s1 < s2)
				return -1;
			return 0;
		});
	}

    ngOnInit(): void {
	}

	public get MuskelListe(): Array<MuscleGroup>{
		return this.fDexieService.MuskelgruppeListeSortedByName();
	}
	
	public get HantelListe(): Array<Hantel>{
		return DexieSvcService.LangHantelListe;
	}
	
	closeDialog() {
		this.onBeforeClose();
	}

	back() {
		this.onBeforeClose();
	}
	
	onBeforeClose() {
		this.Uebung.SatzListe = [];
		this.CmpUebung.SatzListe = [];
		if (this.Uebung.isEqual(this.CmpUebung)) { this.fDialog.close(); }
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
			
			mDialogData.OkFn = (): void => {
				this.SaveChanges();
			}

			mDialogData.CancelFn = (): void => {
				const mCancelDialogData = new DialogData();
				mCancelDialogData.textZeilen.push("Changes will be lost!");
				mCancelDialogData.textZeilen.push("Are you shure?");
				mCancelDialogData.OkFn = (): void => {
					const mIndex = this.UebungEditData.fUebungListe.indexOf(this.Uebung);
					
					if (mIndex > -1) 
						this.UebungEditData.fUebungListe[mIndex] = this.CmpUebung;
						
					this.fDialog.close();
				};
				this.fDialogService.JaNein(mCancelDialogData);
			}

			this.fDialogService.JaNein(mDialogData);
		}
    }

    SaveChanges() {
		if (this.Uebung.Name.trim() === '') {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push('Please enter a name!');
			this.fDialogService.Hinweis(mDialogData);
		} else {
			if (
				(this.Uebung.ID === undefined || this.Uebung.ID <= 0)
				&& this.fDexieService.FindUebung(this.Uebung)
			) {
				const mDialogData = new DialogData();
				mDialogData.textZeilen.push(
					`There is already an exercise with name "${this.Uebung.Name}"!`
				);
				this.fDialogService.Hinweis(mDialogData);
			} else {
				this.fDialog.close();
				this.fDexieService.UebungSpeichern(this.Uebung)
					.then(() => {
						let mUebungListe: Array<Uebung> = this.UebungEditData.fUebungListe;
						this.CmpUebung = this.Uebung.Copy();
						const mIndex = this.UebungEditData.fUebungListe.findIndex((u) => u.ID === this.Uebung.ID);
						if (mIndex < 0) {
							mUebungListe.push(this.Uebung);
							mUebungListe = mUebungListe.sort(
								(s1, s2) => {
									if (s1.Name > s2.Name)
										return 1;
									if (s1.Name < s2.Name)
										return -1;
									return 0;
								}
							);
						}
						
						//this.UebungEditData.fUebungListe.push(this.Uebung);
						//(this.fDialog.componentInstance as EditExerciseComponent).UebungEditData.fUebungListe.push(this.Uebung);
						this.fDexieService.LadeStammUebungen(
							() => {
								if (this.fDialog)
									this.fDialog.close();
							}
						);
					});
			}
		}
	}

	CancelChanges() {
		const mTmpEditExerciseComponent: EditExerciseComponent = this; //.ClickData as EditExerciseComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Cancel unsaved changes?');
		mDialogData.OkFn = (): void => {
			mTmpEditExerciseComponent.Uebung = mTmpEditExerciseComponent.CmpUebung.Copy();
			if (mTmpEditExerciseComponent.fDialog) {
				const mUebungsListe: Array<Uebung> = (mTmpEditExerciseComponent.fDialog.componentInstance as EditExerciseComponent).UebungEditData.fUebungListe;
				const mIndex = mUebungsListe.findIndex((u) => u.ID === mTmpEditExerciseComponent.CmpUebung.ID);
				if (mIndex > -1) mUebungsListe[mIndex] = mTmpEditExerciseComponent.CmpUebung;
				mTmpEditExerciseComponent.fDialog.close();
			}
		};

		mTmpEditExerciseComponent.fDialogService.JaNein(mDialogData);
	}

}

