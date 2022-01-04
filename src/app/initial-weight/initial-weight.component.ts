import { InitialWeight } from "./../../Business/Uebung/InitialWeight";
import { TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DexieSvcService } from "../services/dexie-svc.service";
import { DialogeService } from "../services/dialoge.service";
import { Location } from "@angular/common";
import { Uebung } from "src/Business/Uebung/Uebung";
import { floatMask } from "../app.module";
import { DialogData } from "src/app/dialoge/hinweis/hinweis.component";

@Component({
	selector: "app-initial-weight",
	templateUrl: "./initial-weight.component.html",
	styleUrls: ["./initial-weight.component.scss"],
})
export class InitialWeightComponent implements OnInit {
	Program: TrainingsProgramm;
	InitialWeightList: Array<InitialWeight> = [];
	public floatMask = floatMask;

	constructor(private router: Router, public fDexieService: DexieSvcService, private location: Location, public fDialogService: DialogeService) {
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { Program: TrainingsProgramm };
		this.Program = mState.Program;
		const mUebungen: Array<Uebung> = [];
		this.Program.SessionListe.forEach((s) => s.ExtractUebungen(mUebungen));

		mUebungen.forEach((u) => {
			const mInitialWeight = new InitialWeight();
			mInitialWeight.Name = u.Name;
			mInitialWeight.UebungID = u.FkUebung;
			mInitialWeight.Weight = 0;
			this.InitialWeightList.push(mInitialWeight);
		});

		this.InitialWeightList = this.InitialWeightList.sort((a: InitialWeight, b: InitialWeight) => {
			if (a.Name > b.Name) return 1;

			if (a.Name < b.Name) return -1;

			return 0;
		});
	}

	ngOnInit(): void {}

	SetWeight(aWeightItem: InitialWeight, aEvent: any) {
		aWeightItem.Weight = aEvent.target.value;
	}

	onInitialWeightClick(aEvent: any) {
		aEvent.target.select();
	}

	OkClick() {
		this.fDexieService.SetAktuellesProgramm(this.Program, this.InitialWeightList).then(() => this.router.navigate(['']));
	}

	CancelClick() {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Go ahead without initial weights?");
		mDialogData.OkFn = (): void => {
			this.fDexieService.SetAktuellesProgramm(this.Program
			).then(() => this.router.navigate([''])
		)};
		this.fDialogService.JaNein(mDialogData);
	}
}
