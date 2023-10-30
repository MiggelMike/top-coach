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

	minDate: Date = new Date();
	maxDate: Date = new Date();
	disabled: Boolean = false;
	touchUi: Boolean = true;
	enableMeridian: Boolean = true;
	disableMinute: Boolean = false;
	hideTime: Boolean = false;
	

  constructor(private fDbModul: DexieSvcService,public fDialogService: DialogeService, private location: Location) {
    this.fDbModul.LadeBodyweight().then((aBodyweights) => {
      aBodyweights.forEach((aBodyWeight) => {
        this.BodyweightList.push(aBodyWeight.Copy());
      })
    });
  }

SetDatum(aBodyWeight: BodyWeight, aEvent: any) {
	aBodyWeight.Datum = aEvent.target.value;
}
	
  ngOnInit(): void { }
  
  NewBodyweight() {
    const mBodyweight: BodyWeight = new BodyWeight();
    mBodyweight.Datum = new Date();
    this.BodyweightList.unshift(mBodyweight);
  }

  DeleteBodyweight(aBw: BodyWeight) {
	  const mDialogData = new DialogData();
	  mDialogData.textZeilen.push("Delete Record?");
	  mDialogData.ShowAbbruch = false;
	  mDialogData.OkFn = (): void => {
		  const mIndex = this.BodyweightList.indexOf(aBw);
		  this.BodyweightList.splice(mIndex, 1);
		  if (mIndex > -1)
		  	this.fDbModul.DeleteBodyweight(aBw.ID);
	  }
	this.fDialogService.JaNein(mDialogData);		  
	}
	
	back() {
		this.fDbModul.BodyweightListeSpeichern(this.BodyweightList);
		this.location.back();
	}

  ngOnDestroy() {
  }
  
	SetBodyweight(aEvent: any, aBw: BodyWeight) {
		aEvent.stopPropagation();
		aBw.Weight = Number(aEvent.target.value);
	}
}
