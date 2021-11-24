import { MuscleGroup } from './../../Business/MuscleGroup/MuscleGroup';
import { DexieSvcService } from './../services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { Router } from '@angular/router';
import { Location } from '@angular/common'


@Component({
    selector: 'app-edit-exercise',
    templateUrl: './edit-exercise.component.html',
    styleUrls: ['./edit-exercise.component.scss']
})
export class EditExerciseComponent implements OnInit {
    public Uebung: Uebung = null;
    public CmpMuskelgruppe: Uebung = null;
    public ClickData: EditExerciseComponent;
    selectedValue: string;
    foods: Food[] = [
        {value: 'steak-0', viewValue: 'Steak'},
        {value: 'pizza-1', viewValue: 'Pizza'},
        {value: 'tacos-2', viewValue: 'Tacos'},
      ];

    constructor(private router: Router, private fDbModul: DexieSvcService, private location: Location) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { ueb: Uebung; };
        this.Uebung = mState.ueb;
    }

    ngOnInit(): void {
    }

    public get MuskelListe(): Array<MuscleGroup>{
        const mComboListe: Array<MuscleGroup> = this.fDbModul.MuskelgruppeListeSortedByName.map(m => m);
        mComboListe.unshift(new MuscleGroup());
        return mComboListe;
    }
    
    back() {
        this.location.back();
    }

    SaveChanges() {
		// const mTmpEditMuscleGroupComponent: EditMuscleGroupComponent = this
		// 	.ClickData as EditMuscleGroupComponent;
		// if (mTmpEditMuscleGroupComponent.Muskelgruppe.Name.trim() === '') {
		// 	const mDialogData = new DialogData();
		// 	mDialogData.textZeilen.push('Please enter a name!');
		// 	mTmpEditMuscleGroupComponent.fDialogService.Hinweis(mDialogData);
		// } else {
		// 	if (
		// 		(mTmpEditMuscleGroupComponent.Muskelgruppe.ID === undefined ||
		// 			mTmpEditMuscleGroupComponent.Muskelgruppe.ID <= 0) &&
		// 		mTmpEditMuscleGroupComponent.fDexieSvcService.FindMuskel(
		// 			mTmpEditMuscleGroupComponent.Muskelgruppe
		// 		)
		// 	) {
		// 		const mDialogData = new DialogData();
		// 		mDialogData.textZeilen.push(
		// 			`There is already a muscle with name "${mTmpEditMuscleGroupComponent.Muskelgruppe.Name}"!`
		// 		);
		// 		mTmpEditMuscleGroupComponent.fDialogService.Hinweis(mDialogData);
		// 	} else {
		// 		mTmpEditMuscleGroupComponent.fDexieSvcService
		// 			.MuskelgruppeSpeichern(mTmpEditMuscleGroupComponent.Muskelgruppe)
		// 			.then((mID: number) => {
		// 				mTmpEditMuscleGroupComponent.Muskelgruppe.ID = mID;
		// 				mTmpEditMuscleGroupComponent.CmpMuskelgruppe =
		// 					mTmpEditMuscleGroupComponent.Muskelgruppe.Copy();
		// 				mTmpEditMuscleGroupComponent.fDexieSvcService.LadeMuskelGruppen();
		// 			});
		// 	}
		// }
	}

	CancelChanges() {
		// const mTmpEditMuscleGroupComponent: EditMuscleGroupComponent = this
		// 	.ClickData as EditMuscleGroupComponent;
		// const mDialogData = new DialogData();
		// mDialogData.textZeilen.push('Cancel unsaved changes?');
		// mDialogData.OkFn = (): void => {
		// 	mTmpEditMuscleGroupComponent.Muskelgruppe =
		// 		mTmpEditMuscleGroupComponent.CmpMuskelgruppe.Copy();
		// };

		// mTmpEditMuscleGroupComponent.fDialogService.JaNein(mDialogData);
	}

}

interface Food {
    value: string;
    viewValue: string;
  }
