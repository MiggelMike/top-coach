import { Component, OnInit } from '@angular/core';
import { TrainingsProgrammSvcService } from '../services/trainings-programm-svc.service';
import { Session } from '../../Business/Session/Session';

@Component({
    selector: 'app-anstehende-sessions',
    templateUrl: './anstehende-sessions.component.html',
    styleUrls: ['./anstehende-sessions.component.scss']
})
export class AnstehendeSessionsComponent implements OnInit {

    public AnstehendeSessions: Session[];

    constructor(private trainingsProgrammSvcService: TrainingsProgrammSvcService) {
        this.AnstehendeSessions = this.LadeSessions();
     }

    ngOnInit() {
        this.AnstehendeSessions = this.LadeSessions();
    }

    public LadeSessions(): Array<Session> {
        // this.sensorikService.getAttribute()
        // .subscribe(res => {
        //     this.sensorikAttribute = res;
        //     if ((this.sensorikAttribute !== undefined) && (this.sensorikAttribute.length > 0)) {
        //         this.Kategorie = this.sensorikAttribute[0].kategorieDE01;
        //     }
        // });
        this.AnstehendeSessions = this.trainingsProgrammSvcService.LadeAnstehendeSession();
        return this.AnstehendeSessions;
    }

}
