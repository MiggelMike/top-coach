import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuscleGroup } from 'src/Business/MuscleGroup/MuscleGroup';
import { Location } from '@angular/common'
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';


@Component({
    selector: 'app-edit-muscle-group',
    templateUrl: './edit-muscle-group.component.html',
    styleUrls: ['./edit-muscle-group.component.scss']
})
export class EditMuscleGroupComponent implements OnInit {

    public Muskelgruppe: MuscleGroup = null;
    private CmpMuskelgruppe: MuscleGroup = null;

    constructor(
        private router: Router,
        private fDialogService : DialogeService,
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
        let s = '';
        if (this.Muskelgruppe.isEqual(this.CmpMuskelgruppe))
            this.location.back();
        else {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push("Cancel unsaved changes?");
            mDialogData.OkFn = (): void => this.location.back();
            
            this.fDialogService.JaNein(mDialogData);
        }
    }

}
