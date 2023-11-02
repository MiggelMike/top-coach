import { Component, OnInit } from "@angular/core";
import { Hantelscheibe } from "src/Business/Hantelscheibe/Hantelscheibe";
import { DialogData } from "../dialoge/hinweis/hinweis.component";
import { Location, formatNumber } from "@angular/common";
import { DexieSvcService, cWeightFormat } from "../services/dexie-svc.service";
import { DialogeService } from "../services/dialoge.service";

@Component({
	selector: "app-scheiben",
	templateUrl: "./scheiben.component.html",
	styleUrls: ["./scheiben.component.scss"],
})
export class ScheibenComponent implements OnInit {
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

	public GetWeightText(aScheibe: Hantelscheibe): string{
		return formatNumber(aScheibe.Gewicht,'en-US', cWeightFormat);
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
			const mIndex = this.HantelscheibenListe.indexOf(aScheibe);
			if (mIndex >= 0) {
				this.HantelscheibenListe.splice(mIndex, 1);
			}
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
				this.location.back();
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
		
		this.CmpHantelscheibenListe.forEach(
			(mCpmHantelScheibe: Hantelscheibe) => {
				if (mCpmHantelScheibe.ID !== undefined) {
					if (!this.HantelscheibenListe.find(
						(mHantelscheibe) => {
							return mHantelscheibe.ID === mCpmHantelScheibe.ID;
					})) {
						this.fDexieSvcService.DeleteHantelscheibe(mCpmHantelScheibe.ID);
					}
				}
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
