import { cDateTimeFormat, DexieSvcService } from '../services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { BodyWeight } from '../../Business/Bodyweight/Bodyweight';
import { Location } from "@angular/common";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DialogeService } from '../services/dialoge.service';

@Component({
	selector: 'app-bodyweight',
	templateUrl: './bodyweight.component.html',
	styleUrls: ['./bodyweight.component.scss'],
})
export class BodyweightComponent implements OnInit {
  DateTimeFormat: string = cDateTimeFormat;
  BodyweightList: Array<BodyWeight> = [];
	CmpBodyweightList: Array<BodyWeight> = [];

	minDate: Date = new Date();
	maxDate: Date = new Date();
	disabled: Boolean = false;
	showSpinners: Boolean = true;
	showSeconds: Boolean = true;
	stepHour: Boolean = true;
	stepMinute: Boolean = true;
	stepSecond: Boolean = true;
	touchUi: Boolean = true;
	enableMeridian: Boolean = true;
	disableMinute: Boolean = false;
	hideTime: Boolean = false;
	

  constructor(private fDbModul: DexieSvcService,public fDialogService: DialogeService, private location: Location) {
    this.fDbModul.LadeBodyweight().then((aBodyweights) => {
      aBodyweights.forEach((aBodyWeight) => {
        this.BodyweightList.push(aBodyWeight.Copy());
        this.CmpBodyweightList.push(aBodyWeight.Copy());
      })
    });
  }

  ngOnInit(): void { }

  private ChangesExist(): Boolean {
		if (this.BodyweightList.length !== this.CmpBodyweightList.length)
		    return true;

		for (let index = 0; index < this.BodyweightList.length; index++) {
		    const mBodyWeight = this.BodyweightList[index];
		    if (mBodyWeight.ID === undefined)
		        return true;

		    const mCmpHantel = this.CmpBodyweightList.find((h) => h.ID === mBodyWeight.ID);
		    if (mBodyWeight.ID === undefined)
		        return true;

		    if (mBodyWeight.isEqual(mCmpHantel) === false)
		        return true;
		}
		return false;
  }
  
  SaveChanges() {
    this.fDbModul.BodyweightListeSpeichern(this.BodyweightList);
    this.CmpBodyweightList.forEach(
			(mCpmBodyWeight: BodyWeight) => {
				if (mCpmBodyWeight.ID !== undefined) {
					if (!this.BodyweightList.find(
						(mBodyWeight) => {
							return mBodyWeight.ID === mCpmBodyWeight.ID;
					})) {
						this.fDbModul.DeleteBodyweight(mCpmBodyWeight.ID);
					}
				}
		});
	}

  back() {
		if (this.ChangesExist() === false) this.location.back();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
			
			mDialogData.OkFn = (): void => {
        this.SaveChanges();
        this.location.back();
			}

			mDialogData.CancelFn = (): void => {
				this.location.back();
			}

			this.fDialogService.JaNein(mDialogData);
		}
	}

  NewBodyweight() {
    const mBodyweight: BodyWeight = new BodyWeight();
    mBodyweight.Datum = new Date();
    this.BodyweightList.unshift(mBodyweight);
  }

  DeleteBodyweight(aBw: BodyWeight) {
    const mIndex = this.BodyweightList.indexOf(aBw);
    if (mIndex > -1) this.BodyweightList.splice(mIndex, 1);
  }

  ngOnDestroy() {
  }
  
  SetBodyweight(aEvent: any, aBw: BodyWeight) {
    aEvent.stopPropagation();
    aBw.Weight = Number(aEvent.target.value);
  }
}
