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


@Component({
    selector: 'app-edit-exercise',
    templateUrl: './edit-exercise.component.html',
    styleUrls: ['./edit-exercise.component.scss']
})
export class EditExerciseComponent implements OnInit {
    public Uebung: Uebung = null;
    public CmpUebung: Uebung = null;
	public ClickData: EditExerciseComponent;
	
	constructor(
		private router: Router,
		public fDexieService: DexieSvcService,
		private location: Location,
		public fDialogService: DialogeService
		) {
			const mNavigation = this.router.getCurrentNavigation();
			const mState = mNavigation.extras.state as { ueb: Uebung; };
			this.Uebung = mState.ueb.Copy();
			this.CmpUebung = mState.ueb.Copy();
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
		return this.fDexieService.LangHantelListe;
    }

    
    back() {
		if (this.Uebung.isEqual(this.CmpUebung))
			this.location.back();
		else {
		  const mDialogData = new DialogData();
		  mDialogData.textZeilen.push('Cancel unsaved changes?');
		  mDialogData.OkFn = (): void => this.location.back();
	
		  this.fDialogService.JaNein(mDialogData);
		}
    }

    SaveChanges() {
		const mTmpEditExerciseComponent: EditExerciseComponent = this.ClickData as EditExerciseComponent;
		if (mTmpEditExerciseComponent.Uebung.Name.trim() === '') {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push('Please enter a name!');
			mTmpEditExerciseComponent.fDialogService.Hinweis(mDialogData);
		} else {
			if (
				(mTmpEditExerciseComponent.Uebung.ID === undefined || mTmpEditExerciseComponent.Uebung.ID <= 0)
				&& mTmpEditExerciseComponent.fDexieService.FindUebung(mTmpEditExerciseComponent.Uebung)
			) {
				const mDialogData = new DialogData();
				mDialogData.textZeilen.push(
					`There is already an exercise with name "${mTmpEditExerciseComponent.Uebung.Name}"!`
				);
				mTmpEditExerciseComponent.fDialogService.Hinweis(mDialogData);
			} else {
				mTmpEditExerciseComponent.fDexieService.UebungSpeichern(mTmpEditExerciseComponent.Uebung)
					.then(() => {
						mTmpEditExerciseComponent.CmpUebung = mTmpEditExerciseComponent.Uebung.Copy();
						mTmpEditExerciseComponent.fDexieService.LadeStammUebungen();
					});

			}
		}
	}

	CancelChanges() {
		const mTmpEditExerciseComponent: EditExerciseComponent = this .ClickData as EditExerciseComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Cancel unsaved changes?');
		mDialogData.OkFn = (): void => {
			mTmpEditExerciseComponent.Uebung = mTmpEditExerciseComponent.CmpUebung.Copy();
		};

		mTmpEditExerciseComponent.fDialogService.JaNein(mDialogData);
	}

}

