import { DialogData } from "src/app/dialoge/hinweis/hinweis.component";
import { ProgressClient, ProgressSet, ProgressTyp } from "./../../Business/Progress/Progress";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DexieSvcService } from "../services/dexie-svc.service";
import { DialogeService } from "../services/dialoge.service";

@Component({
	selector: "app-trainings-gewicht-progress",
	templateUrl: "./trainings-gewicht-progress.component.html",
	styleUrls: ["./trainings-gewicht-progress.component.scss"],
})
export class TrainingsGewichtProgressComponent implements OnInit {
	public NeuerProgress: ProgressClient = null;
	public CmpNeuerProgress: ProgressClient = null;

	constructor(private router: Router, public fDexieService: DexieSvcService, public fDialogService: DialogeService) {
		this.fDexieService.LadeProgress();
	}

	ngOnInit(): void {}

	public get ProgressListe(): Array<ProgressClient> {
		return this.fDexieService.ProgressListeSortedByName();
	}

	public EditProgress(aProgress: ProgressClient): void {
		this.router.navigate(["/app-edit-trainings-gewicht-progress"], { state: { Progress: aProgress } });
	}

	public DoNeuerProgress(): void {
		this.NeuerProgress = new ProgressClient();
		this.NeuerProgress.ProgressSet = ProgressSet.All;
		this.NeuerProgress.ProgressTyp = ProgressTyp.BlockSet;
		this.router.navigate(["/app-edit-trainings-gewicht-progress"], { state: { Progress: this.NeuerProgress } });
	}

	public DeleteProgress(aProgress: ProgressClient) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Delete record?");
		mDialogData.OkFn = (): void => this.DeletePrim(aProgress);
		this.fDialogService.JaNein(mDialogData);
	}

	private DeletePrim(aProgress: ProgressClient) {
		this.fDexieService.ProgressTable.delete(aProgress.ID).then(() => this.CopyProgress());
	}

	private CopyProgress() {
		this.fDexieService.LadeProgress();
	}
}
