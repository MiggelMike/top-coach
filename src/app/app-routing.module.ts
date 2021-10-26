import { SettingsComponent } from './settings/settings.component';
import { SessionFormComponent } from './bausteine/session-form/session-form.component';
// import { CanDeactivateGuard } from 'src/app/can-deactivate-guard';
import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { ProgrammWaehlenComponent } from './programm-waehlen/programm-waehlen.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { EditExerciseComponent } from './edit-exercise/edit-exercise.component';
import { MuscleGroupsComponent } from './muscle-groups/muscle-groups.component';
import { EditMuscleGroupComponent } from './edit-muscle-group/edit-muscle-group.component';


export const routes: Routes = [
    { path: '', component: AnstehendeSessionsComponent },
    { path: 'programmwaehlen', component: ProgrammWaehlenComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'exercise', component:  ExerciseComponent },
    { path: 'edit-exercise', component:  EditExerciseComponent },
    { path: 'muscle-groups', component:  MuscleGroupsComponent },
    { path: 'edit-muscle-group', component:  EditMuscleGroupComponent },
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
