import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuscleGroup } from 'src/Business/MuscleGroup/MuscleGroup';
import { Location } from '@angular/common'

@Component({
    selector: 'app-edit-muscle-group',
    templateUrl: './edit-muscle-group.component.html',
    styleUrls: ['./edit-muscle-group.component.scss']
})
export class EditMuscleGroupComponent implements OnInit {

    public Muskelgruppe: MuscleGroup = null;
    constructor(private router: Router, private location: Location) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { mg: MuscleGroup; };
        this.Muskelgruppe = mState.mg;
    }

    ngOnInit(): void {
    }
    
    back() {
        this.location.back();
    }

}
