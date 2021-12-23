import { DialogeService } from "./../services/dialoge.service";
import { Component, OnInit } from "@angular/core";
import { DexieSvcService } from "../services/dexie-svc.service";
import { Uebung } from "src/Business/Uebung/Uebung";
import { Router } from "@angular/router";
import { DialogData } from "../dialoge/hinweis/hinweis.component";
import { Location } from '@angular/common'

@Component({
	selector: "app-exercise",
	templateUrl: "./exercise.component.html",
	styleUrls: ["./exercise.component.scss"],
})
export class ExerciseComponent implements OnInit {
	public SelectMode: boolean = false;
	public SelectedExerciseList: Array<Uebung>;

	constructor(
		private location: Location,
		private fDexieSvcService: DexieSvcService,
		private router: Router,
		private fDialogService: DialogeService)
	{
		const x = 0;
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { SelectMode: boolean; SelectedExerciseList: Array<Uebung>};
		if (mState && mState.SelectMode && mState.SelectedExerciseList) {
			this.SelectMode = mState.SelectMode;
			this.SelectedExerciseList = mState.SelectedExerciseList;
		}
	}

	ngOnInit(): void {}

	public get UebungListeSortedByName(): Array<Uebung> {
		return this.fDexieSvcService.UebungListeSortedByName;
	}

	public EditExercise(aUebung: Uebung): void {
		this.router.navigate(["/edit-exercise"], { state: { ueb: aUebung } });
	}

	public NewExercise(): void {
		this.router.navigate(["/edit-exercise"], { state: { ueb: new Uebung() } });
	}

	public DeleteExercise(aUebung: Uebung): void {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Delete record?");
		mDialogData.OkFn = (): void => {
            this.fDexieSvcService.UebungTable.delete(aUebung.ID);
            this.fDexieSvcService.LadeStammUebungen();
		};

		this.fDialogService.JaNein(mDialogData);
	}

	public OkClickFn() {
		this.UebungListeSortedByName.forEach((u) => {
			if((u.Selected)&&(this.SelectedExerciseList.indexOf(u) < 0))
				this.SelectedExerciseList.push(u)
		});
		this.location.back();
	}

	public CancelClickFn() {
		this.location.back();
	}
}
