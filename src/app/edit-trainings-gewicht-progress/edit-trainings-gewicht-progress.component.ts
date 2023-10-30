import { IProgress, Progress } from './../../Business/Progress/Progress';
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DialogData } from "../dialoge/hinweis/hinweis.component";
import { DexieSvcService } from "../services/dexie-svc.service";
import { DialogeService } from "../services/dialoge.service";
import { Location } from "@angular/common";

@Component({
	selector: "app-edit-trainings-gewicht-progress",
	templateUrl: "./edit-trainings-gewicht-progress.component.html",
	styleUrls: ["./edit-trainings-gewicht-progress.component.scss"],
})
export class EditTrainingsGewichtProgressComponent implements OnInit {
	public Progress: IProgress;
	public CmpProgress: IProgress;
	public ClickData: EditTrainingsGewichtProgressComponent;

	constructor(private router: Router, public fDexieService: DexieSvcService, private location: Location, public fDialogService: DialogeService)
	{
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { Progress: Progress };
		this.Progress = mState.Progress.Copy();
		this.CmpProgress = mState.Progress.Copy();
	}

	ngOnInit(): void {}

	SetAdditionalReps(aEvent: any) {
		this.Progress.AdditionalReps = aEvent.target.value;
	}

	ShowInfo() {
		// const mDialogData = new DialogData();
		// mDialogData.textZeilen.push("If ");
		// mDialogData.textZeilen.push("The sum of the repetitions of all sets must be at least the sum of the above target reps of all sets.");
		// // mDialogData.OkFn = (): void => this.location.back();		
		// this.fDialogService.Hinweis(mDialogData);
		
	}

	back() {
		if (this.Progress.isEqual(this.CmpProgress)) this.location.back();
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
				mCancelDialogData.OkFn = (): void => this.location.back();
				this.fDialogService.JaNein(mCancelDialogData);
			}

			this.fDialogService.JaNein(mDialogData);
		}



		// if (this.Progress.isEqual(this.CmpProgress)) this.location.back();
		// else {
		// 	const mDialogData = new DialogData();
		// 	mDialogData.textZeilen.push("Cancel unsaved changes?");
		// 	mDialogData.OkFn = (): void => this.location.back();

		// 	this.fDialogService.JaNein(mDialogData);
		// }
	}

	SaveChanges() {
		if (this.Progress.Name.trim() === "") {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Please enter a name!");
			this.fDialogService.Hinweis(mDialogData);
		} else {
			this.fDexieService.ProgressSpeichern(this.Progress as Progress)
				.then(() => {
					this.location.back();
				}).catch((e) => {
					const mDialogData = new DialogData();
					if(e.message.indexOf('at least one key does not satisfy the uniqueness requirements') > -1) 
							mDialogData.textZeilen.push(`There is already a progess schema with name "${this.Progress.Name}"!`);
					else
						mDialogData.textZeilen.push(e.message);
					
					this.fDialogService.Hinweis(mDialogData);
				});
		}
	}

	CancelChanges() {
		const mTmpEditTrainingsGewichtProgressComponent: EditTrainingsGewichtProgressComponent = this.ClickData as EditTrainingsGewichtProgressComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Cancel unsaved changes?");
		mDialogData.OkFn = (): void => {
			mTmpEditTrainingsGewichtProgressComponent.Progress = mTmpEditTrainingsGewichtProgressComponent.CmpProgress.Copy();
		};

		mTmpEditTrainingsGewichtProgressComponent.fDialogService.JaNein(mDialogData);
	}
}
