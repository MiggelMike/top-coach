import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuscleGroup } from 'src/Business/MuscleGroup/MuscleGroup';
import { Location } from '@angular/common'
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DexieSvcService } from '../services/dexie-svc.service';


@Component({
    selector: 'app-edit-muscle-group',
    templateUrl: './edit-muscle-group.component.html',
    styleUrls: ['./edit-muscle-group.component.scss']
})
export class EditMuscleGroupComponent implements OnInit {

    public Muskelgruppe: MuscleGroup = null;
    public CmpMuskelgruppe: MuscleGroup = null;

    constructor(
        private router: Router,
        public fDialogService: DialogeService,
        public  fDexieSvcService: DexieSvcService,
        private location: Location)
    {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { mg: MuscleGroup; };
        this.Muskelgruppe = mState.mg.Copy();
        this.CmpMuskelgruppe = mState.mg.Copy();
    }

    ngOnInit(): void {
    }
    
    back() {
        if (this.Muskelgruppe.isEqual(this.CmpMuskelgruppe))
            this.location.back();
        else {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push("Cancel unsaved changes?");
            mDialogData.OkFn = (): void => this.location.back();

            this.fDialogService.JaNein(mDialogData);
        }
    }

    SaveChanges() {
        const mTmpEditMuscleGroupComponent: EditMuscleGroupComponent = (this.ClickData as EditMuscleGroupComponent);
        mTmpEditMuscleGroupComponent.fDexieSvcService.MuskelgruppeSpeichern(mTmpEditMuscleGroupComponent.Muskelgruppe)
            .then(mID => {
                mTmpEditMuscleGroupComponent.Muskelgruppe.ID = mID;
                mTmpEditMuscleGroupComponent.CmpMuskelgruppe = mTmpEditMuscleGroupComponent.Muskelgruppe.Copy();
                mTmpEditMuscleGroupComponent.fDexieSvcService.LadeMuskelGruppen();
            }
            );
        
    }

    CancelChanges() {
        const mTmpEditMuscleGroupComponent: EditMuscleGroupComponent = (this.ClickData as EditMuscleGroupComponent);
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => { mTmpEditMuscleGroupComponent.Muskelgruppe = mTmpEditMuscleGroupComponent.CmpMuskelgruppe.Copy(); }
        
        mTmpEditMuscleGroupComponent.fDialogService.JaNein(mDialogData);
    }

}
