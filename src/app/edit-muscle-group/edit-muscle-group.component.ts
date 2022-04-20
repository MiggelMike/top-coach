import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MuscleGroup } from 'src/Business/MuscleGroup/MuscleGroup';
import { Location } from '@angular/common';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DexieSvcService } from '../services/dexie-svc.service';

@Component({
  selector: 'app-edit-muscle-group',
  templateUrl: './edit-muscle-group.component.html',
  styleUrls: ['./edit-muscle-group.component.scss'],
})
export class EditMuscleGroupComponent implements OnInit {
  public Muskelgruppe: MuscleGroup;
  public CmpMuskelgruppe: MuscleGroup;
  public ClickData: EditMuscleGroupComponent;
  @ViewChild('Name') NameField: ElementRef;

  constructor(
    private router: Router,
    public fDialogService: DialogeService,
    public fDexieSvcService: DexieSvcService,
    private location: Location
  ) {
    const mNavigation = this.router.getCurrentNavigation();
    const mState = mNavigation.extras.state as { mg: MuscleGroup };
    this.Muskelgruppe = mState.mg.Copy();
    this.CmpMuskelgruppe = mState.mg.Copy();
  }

  ngOnInit(): void {}

  back() {
	  
	if (this.Muskelgruppe.isEqual(this.CmpMuskelgruppe)) this.location.back();
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

  ngAfterViewInit() {
    this.NameField.nativeElement.focus();
  }

	SaveChanges() {
		if (this.Muskelgruppe.Name.trim() === '') {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push('Please enter a name!');
			this.fDialogService.Hinweis(mDialogData);
		} else {
			this.location.back();
			if (
				(this.Muskelgruppe.ID === undefined ||
					this.Muskelgruppe.ID <= 0) &&
				this.fDexieSvcService.FindMuskel(
					this.Muskelgruppe
				)
			) {
				const mDialogData = new DialogData();
				mDialogData.textZeilen.push(
					`There is already a muscle with name "${this.Muskelgruppe.Name}"!`
				);
				this.fDialogService.Hinweis(mDialogData);
			} else {
				this.fDexieSvcService
					.MuskelgruppeSpeichern(this.Muskelgruppe)
					.then((mID: number) => {
						this.Muskelgruppe.ID = mID;
						this.CmpMuskelgruppe = this.Muskelgruppe.Copy();
						this.fDexieSvcService.LadeMuskelGruppen();
					});
			}
		}
	}

	CancelChanges() {
		const mTmpEditMuscleGroupComponent: EditMuscleGroupComponent = this
			.ClickData as EditMuscleGroupComponent;
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push('Cancel unsaved changes?');
		mDialogData.OkFn = (): void => {
			mTmpEditMuscleGroupComponent.Muskelgruppe =
				mTmpEditMuscleGroupComponent.CmpMuskelgruppe.Copy();
		};

		mTmpEditMuscleGroupComponent.fDialogService.JaNein(mDialogData);
	}
}
