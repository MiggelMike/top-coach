import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { ProgrammWaehlenComponent } from './programm-waehlen/programm-waehlen.component';


const routes: Routes = [
    { path: '', component: AnstehendeSessionsComponent },
    { path: 'programmwaehlen', component: ProgrammWaehlenComponent },
    { path: 'workoutform', component: WorkoutFormComponent },
    
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
