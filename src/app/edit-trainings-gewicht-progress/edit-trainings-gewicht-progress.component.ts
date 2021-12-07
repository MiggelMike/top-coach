import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressClient } from 'src/Business/Progress/Progress';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-edit-trainings-gewicht-progress',
  templateUrl: './edit-trainings-gewicht-progress.component.html',
  styleUrls: ['./edit-trainings-gewicht-progress.component.scss']
})
  
export class EditTrainingsGewichtProgressComponent implements OnInit {


  public Progress: ProgressClient;
  public CmpProgress: ProgressClient;
  public ClickData: EditTrainingsGewichtProgressComponent;

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
		const mTmpEditTrainingsGewichtProgressComponent: EditTrainingsGewichtProgressComponent = this.ClickData as EditTrainingsGewichtProgressComponent;
		if (mTmpEditTrainingsGewichtProgressComponent.Progress.Name.trim() === '') {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push('Please enter a name!');
			mTmpEditTrainingsGewichtProgressComponent.fDialogService.Hinweis(mDialogData);
		} else {
			if ( (mTmpEditTrainingsGewichtProgressComponent.Progress.ID === undefined || mTmpEditTrainingsGewichtProgressComponent.Progress.ID <= 0)
				//  && mTmpEditExerciseComponent.fDexieService.FindUebung(mTmpEditExerciseComponent.Progress)
			) {
				const mDialogData = new DialogData();
				mDialogData.textZeilen.push(
					`There is already a progess with name "${mTmpEditTrainingsGewichtProgressComponent.Progress.Name}"!`
				);
				mTmpEditTrainingsGewichtProgressComponent.fDialogService.Hinweis(mDialogData);
			} else {
				mTmpEditTrainingsGewichtProgressComponent.fDexieService.ProgressSpeichern(mTmpEditTrainingsGewichtProgressComponent.Progress)
					.then(() => {
						mTmpEditTrainingsGewichtProgressComponent.CmpProgress = mTmpEditTrainingsGewichtProgressComponent.Progress.Copy();
						mTmpEditTrainingsGewichtProgressComponent.fDexieService.LadeProgress();
					});
			}
		}
	}

	CancelChanges() {
		const mTmpEditTrainingsGewichtProgressComponent: EditTrainingsGewichtProgressComponent = this .ClickData as EditTrainingsGewichtProgressComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Cancel unsaved changes?');
		mDialogData.OkFn = (): void => {
			mTmpEditTrainingsGewichtProgressComponent.Progress = mTmpEditTrainingsGewichtProgressComponent.CmpProgress.Copy();
		};

		mTmpEditTrainingsGewichtProgressComponent.fDialogService.JaNein(mDialogData);
	}
}
