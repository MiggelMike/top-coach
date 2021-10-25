import { SettingsComponent } from './settings/settings.component';
import { SessionFormComponent } from './bausteine/session-form/session-form.component';
// import { CanDeactivateGuard } from 'src/app/can-deactivate-guard';
import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { ProgrammWaehlenComponent } from './programm-waehlen/programm-waehlen.component';
import { ExerciseComponent } from './exercise/exercise.component';


export const routes: Routes = [
    { path: '', component: AnstehendeSessionsComponent },
    { path: 'programmwaehlen', component: ProgrammWaehlenComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'exercise', component:  ExerciseComponent },
    { path: 'workoutform', component: WorkoutFormComponent },
    { path: 'sessionFormComponent', component: SessionFormComponent, data: { title: 'welcome', toolbar: false} },
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
