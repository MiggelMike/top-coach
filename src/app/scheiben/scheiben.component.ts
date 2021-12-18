import { Component, OnInit } from "@angular/core";
import { Hantelscheibe } from "src/Business/Hantelscheibe/Hantelscheibe";
import { DialogData } from "../dialoge/hinweis/hinweis.component";
import { floatMask, repMask, Int2DigitMask, Int4DigitMask } from "./../app.module";
import { Location } from "@angular/common";
import { DexieSvcService } from "../services/dexie-svc.service";
import { DialogeService } from "../services/dialoge.service";

@Component({
	selector: "app-scheiben",
	templateUrl: "./scheiben.component.html",
	styleUrls: ["./scheiben.component.scss"],
})
export class ScheibenComponent implements OnInit {
	public floatMask = floatMask;
	public repMask = repMask;
	public Int2DigitMask = Int2DigitMask;
	public Int4DigitMask = Int4DigitMask;
	public ClickData: ScheibenComponent = this;

	public HantelscheibenListe: Array<Hantelscheibe> = [];
	public CmpHantelscheibenListe: Array<Hantelscheibe> = [];

	constructor(private location: Location, private fDexieSvcService: DexieSvcService, public fDialogService: DialogeService) {
		this.GetHantelscheibenListe();
	}

	ngOnInit(): void {}

	// get HantelscheibenListe(): Array<Hantelscheibe> {
	// 	return this.fDexieSvcService.HantenscheibeListeSortedByDiameterAndWeight;
	// }

	GetHantelscheibenListe() {
		this.fDexieSvcService.LadeHantelscheiben((mHantelscheibenListe) => {
			this.HantelscheibenListe = this.fDexieSvcService.HantenscheibeListeSortedByDiameterAndWeight;
			// mHantelscheibenListe.forEach((hs) => {
			//  	this.HantelscheibenListe.push(hs);
			// });
			this.CopyHantelscheibenList();
		});
	}

	NeueScheibe() {
		this.HantelscheibenListe.push(new Hantelscheibe());
	}

	public SetWeight(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Gewicht = aEvent.target.value;
	}

	public SetAnzahl(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Anzahl = aEvent.target.value;
	}

	public SetDiameter(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Durchmesser = aEvent.target.value;
	}

	Delete(aScheibe: Hantelscheibe) {}

	private ChangesExist(): Boolean {
		if (this.HantelscheibenListe.length !== this.CmpHantelscheibenListe.length)
		    return true;

		for (let index = 0; index < this.HantelscheibenListe.length; index++) {
		    const mHantel = this.HantelscheibenListe[index];
		    if (mHantel.ID === undefined)
		        return true;

		    const mCmpHantel = this.CmpHantelscheibenListe.find((h) => h.ID === mHantel.ID);
		    if (mHantel.ID === undefined)
		        return true;

		    if (mHantel.isEqual(mCmpHantel) === false)
		        return true;
		}
		return false;
	}

	back() {
		const mTmpScheibenComponent: ScheibenComponent = this;
		if (mTmpScheibenComponent.ChangesExist() === false) mTmpScheibenComponent.location.back();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Cancel unsaved changes?");
			mDialogData.OkFn = (): void => mTmpScheibenComponent.location.back();
			mTmpScheibenComponent.fDialogService.JaNein(mDialogData);
		}
	}

	private CopyHantelscheibenList() {
		this.CmpHantelscheibenListe = [];
		for (let index = 0; index < this.HantelscheibenListe.length; index++) {
			this.CmpHantelscheibenListe.push(this.HantelscheibenListe[index].Copy());
		}
	}

	SaveChanges() {
		const mTmpEditScheibenComponent: ScheibenComponent = this.ClickData as ScheibenComponent;
		// const mOhneName: Array<Hantelscheibe> = mTmpEditScheibenComponent.HantelscheibenListe.filter((h) => h.Name.trim() === "");
		// if (mOhneName.length > 0) {
		// const mDialogData = new DialogData();
		// mDialogData.textZeilen.push("A barbell must have a name!");
		// mTmpEditScheibenComponent.fDialogService.Hinweis(mDialogData);
		// } else {
		mTmpEditScheibenComponent.fDexieSvcService
			.InsertHantelscheiben(mTmpEditScheibenComponent.HantelscheibenListe)
			.then((mDummy) => mTmpEditScheibenComponent.GetHantelscheibenListe())
			.catch((e) => {
				if (e.message.indexOf("[Durchmesser+Gewicht]") > 0) {
					const mDialogData = new DialogData();
					mDialogData.textZeilen.push("Diameter and Weight must be unique!");
					mTmpEditScheibenComponent.fDialogService.Hinweis(mDialogData);
				} else alert(e);
			});
	}

	CancelChanges() {
		const mTmpScheibenComponent: ScheibenComponent = this.ClickData as ScheibenComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Cancel unsaved changes?");
		mDialogData.OkFn = (): void => (mTmpScheibenComponent.GetHantelscheibenListe());
		mTmpScheibenComponent.fDialogService.JaNein(mDialogData);
	}
}
