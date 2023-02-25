import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { BodyWeight } from 'src/Business/Bodyweight/Bodyweight';
import { floatMask } from '../app.module';

@Component({
	selector: 'app-bodyweight',
	templateUrl: './bodyweight.component.html',
	styleUrls: ['./bodyweight.component.scss'],
})
export class BodyweightComponent implements OnInit {
  BodyweightList: Array<BodyWeight> = [];
  public floatMask = floatMask;

  constructor(private fDbModul: DexieSvcService) {
    this.fDbModul.LadeBodyweight().then((aBodyweights) => this.BodyweightList = aBodyweights);
  }


  ngOnInit(): void { }

  NewBodyweight() {
    const mBodyweight: BodyWeight = new BodyWeight();
    mBodyweight.Datum = new Date();
    this.BodyweightList.unshift(mBodyweight);
  }

  DeleteBodyweight(aBw: BodyWeight) {
    const mIndex = this.BodyweightList.indexOf(aBw);
    this.fDbModul.DeleteBodyweight(aBw.ID);
    if (mIndex > -1) this.BodyweightList.splice(mIndex, 1);
  }

  ngOnDestroy() {
    this.fDbModul.BodyweightListeSpeichern(this.BodyweightList);
  }
  
  SetBodyweight(aEvent: any, aBw: BodyWeight) {
    aEvent.stopPropagation();
    aBw.Weight = Number(aEvent.target.value);
  }
}
