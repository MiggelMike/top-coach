import { TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { Location } from "@angular/common";

@Component({
  selector: 'app-initial-weight',
  templateUrl: './initial-weight.component.html',
  styleUrls: ['./initial-weight.component.scss']
})
export class InitialWeightComponent implements OnInit {
  Program: TrainingsProgramm;


  constructor(private router: Router, public fDexieService: DexieSvcService, private location: Location, public fDialogService: DialogeService) {
    const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { Program : TrainingsProgramm  };
    this.Program = mState.Program;
  }

  ngOnInit(): void {
  }

}
