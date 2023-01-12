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
		const mNeueScheibe: Hantelscheibe = new Hantelscheibe();
		if (this.HantelscheibenListe.length > 0)
			mNeueScheibe.Durchmesser = this.HantelscheibenListe[this.HantelscheibenListe.length - 1].Durchmesser;
		
		this.HantelscheibenListe.push(mNeueScheibe);
	}

	public SetWeight(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Gewicht = Number(aEvent.target.value);
	}

	public SetAnzahl(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Anzahl = Number(aEvent.target.value);
	}

	public SetDiameter(aScheibe: Hantelscheibe, aEvent: any) {
		aScheibe.Durchmesser = Number(aEvent.target.value);
	}

	Delete(aScheibe: Hantelscheibe) {
		const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Delete record?");
		mDialogData.OkFn = (): void => {
			this.fDexieSvcService.DeleteHantelscheibe(aScheibe.ID)
				.then( () => this.GetHantelscheibenListe() );
		};
        this.fDialogService.JaNein(mDialogData);	
	}

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
		if (this.ChangesExist() === false) this.location.back();
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
	}

	private CopyHantelscheibenList() {
		this.CmpHantelscheibenListe = [];
		for (let index = 0; index < this.HantelscheibenListe.length; index++) {
			this.CmpHantelscheibenListe.push(this.HantelscheibenListe[index].Copy());
		}
	}

	SaveChanges() {
		this.fDexieSvcService
			.InsertHantelscheiben(this.HantelscheibenListe)
			.then((mDummy) => this.location.back())
			.catch((e) => {
				if (e.message.indexOf("[Durchmesser+Gewicht]") > 0) {
					const mDialogData = new DialogData();
					mDialogData.textZeilen.push("Diameter and Weight must be unique!");
					this.fDialogService.Hinweis(mDialogData);
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
