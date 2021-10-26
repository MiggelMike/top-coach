import { Component, OnInit } from '@angular/core';
import { Uebung } from 'src/Business/Uebung/Uebung';
import { Router } from '@angular/router';
import { Location } from '@angular/common'

@Component({
    selector: 'app-edit-exercise',
    templateUrl: './edit-exercise.component.html',
    styleUrls: ['./edit-exercise.component.scss']
})
export class EditExerciseComponent implements OnInit {
    public Uebung: Uebung = null;

    constructor(private router: Router, private location: Location) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { ueb: Uebung; };
        this.Uebung = mState.ueb;
    }

    ngOnInit(): void {
    }
    
    back() {
        this.location.back();
    }


}
