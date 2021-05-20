import { Session } from "./../../../Business/Session/Session";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from '@angular/router';


@Component({
    selector: "app-session-form",
    templateUrl: "./session-form.component.html",
    styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent implements OnInit {
    public Session: Session;

    constructor(private router: Router
        ) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as {
            sess: Session
        };
        this.Session = mState.sess;
    }

    ngAfterViewInit() {
    }

    ngOnInit(): void { 
    }
}
