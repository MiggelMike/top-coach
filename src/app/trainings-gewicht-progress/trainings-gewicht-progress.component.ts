import { DialogData } from 'src/app/dialoge/hinweis/hinweis.component';
import { ProgressClient } from './../../Business/Progress/Progress';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-trainings-gewicht-progress',
  templateUrl: './trainings-gewicht-progress.component.html',
  styleUrls: ['./trainings-gewicht-progress.component.scss']
})
export class TrainingsGewichtProgressComponent implements OnInit {

  public Progress: ProgressClient;
  public CmpProgress: ProgressClient;
  public ClickData: TrainingsGewichtProgressComponent;

  constructor(
    private router: Router,
		public fDexieService: DexieSvcService,
		private location: Location,
    public fDialogService: DialogeService) {
      const mNavigation = this.router.getCurrentNavigation();
      const mState = mNavigation.extras.state as { progress: ProgressClient; };
      this.Progress = mState.progress.Copy();
      this.CmpProgress = mState.progress.Copy();
    }

  ngOnInit(): void {
  }

  back() {
		if (this.Progress.isEqual(this.CmpProgress))
			this.location.back();
		else {
		  const mDialogData = new DialogData();
		  mDialogData.textZeilen.push('Cancel unsaved changes?');
		  mDialogData.OkFn = (): void => this.location.back();
	
		  this.fDialogService.JaNein(mDialogData);
		}
    }

    SaveChanges() {
		const mTmpEditExerciseComponent: TrainingsGewichtProgressComponent = this.ClickData as TrainingsGewichtProgressComponent;
		if (mTmpEditExerciseComponent.Progress.Name.trim() === '') {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push('Please enter a name!');
			mTmpEditExerciseComponent.fDialogService.Hinweis(mDialogData);
		} else {
			if ( (mTmpEditExerciseComponent.Progress.ID === undefined || mTmpEditExerciseComponent.Progress.ID <= 0)
				//  && mTmpEditExerciseComponent.fDexieService.FindUebung(mTmpEditExerciseComponent.Progress)
			) {
				const mDialogData = new DialogData();
				mDialogData.textZeilen.push(
					`There is already a progess with name "${mTmpEditExerciseComponent.Progress.Name}"!`
				);
				mTmpEditExerciseComponent.fDialogService.Hinweis(mDialogData);
			} else {
				mTmpEditExerciseComponent.fDexieService.ProgressSpeichern(mTmpEditExerciseComponent.Progress)
					.then(() => {
						mTmpEditExerciseComponent.CmpProgress = mTmpEditExerciseComponent.Progress.Copy();
						mTmpEditExerciseComponent.fDexieService.LadeProgress();
					});
			}
		}
	}

	CancelChanges() {
		const mTmpTrainingsGewichtProgressComponent: TrainingsGewichtProgressComponent = this .ClickData as TrainingsGewichtProgressComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Cancel unsaved changes?');
		mDialogData.OkFn = (): void => {
			mTmpTrainingsGewichtProgressComponent.Progress = mTmpTrainingsGewichtProgressComponent.CmpProgress.Copy();
		};

		mTmpTrainingsGewichtProgressComponent.fDialogService.JaNein(mDialogData);
	}


}
