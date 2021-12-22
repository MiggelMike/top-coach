import { DialogeService } from "./../services/dialoge.service";
import { Component, OnInit } from "@angular/core";
import { DexieSvcService } from "../services/dexie-svc.service";
import { Uebung } from "src/Business/Uebung/Uebung";
import { Router } from "@angular/router";
import { AnyNumber } from "@angular-package/type";
import { DialogData } from "../dialoge/hinweis/hinweis.component";

@Component({
	selector: "app-exercise",
	templateUrl: "./exercise.component.html",
	styleUrls: ["./exercise.component.scss"],
})
export class ExerciseComponent implements OnInit {

	constructor(private fDexieSvcService: DexieSvcService, private router: Router, private fDialogService: DialogeService) {}

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
}
