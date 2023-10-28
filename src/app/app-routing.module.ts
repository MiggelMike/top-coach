import { BodyweightComponent } from './bodyweight/bodyweight.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { HistoryComponent } from './history/history.component';
import { ITrainingsProgramm } from "./../Business/TrainingsProgramm/TrainingsProgramm";
import { NgModule, inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from "@angular/router";
import { DexieSvcService, ProgrammParaDB, SessionParaDB, UebungParaDB } from "./services/dexie-svc.service";
import { WorkoutFormComponent } from "./bausteine/workout-form/workout-form.component";
import { InitialWeightComponent } from './initial-weight/initial-weight.component';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { SessionFormComponent } from './bausteine/session-form/session-form.component';
import { SettingsComponent } from './settings/settings.component';
import { EditExerciseComponent } from './edit-exercise/edit-exercise.component';
import { MuscleGroupsComponent } from './muscle-groups/muscle-groups.component';
import { EditMuscleGroupComponent } from './edit-muscle-group/edit-muscle-group.component';
import { LanghantelComponent } from './langhantel/langhantel.component';
import { ScheibenComponent } from './scheiben/scheiben.component';

export const LadeStandardProgramme: ResolveFn<ITrainingsProgramm[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	return inject(DexieSvcService)
		.LadeStandardProgramme()
		.then((programme) => {
			return programme;
		});
};

export const LadeAktuellesProgramm: ResolveFn<ITrainingsProgramm> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	return inject(DexieSvcService).LadeAktuellesProgramm();
};	

const routes: Routes = [
	{
		path: "",
		resolve: { AktuellesProgramm: LadeAktuellesProgramm },
		component: AnstehendeSessionsComponent
	}
	, {
		path: "programmwaehlen",
		resolve: { StandardProgramme: LadeStandardProgramme },
		loadChildren: () => import("../app/programm-waehlen/programm-waehlen.module").then((m) => m.ProgrammWaehlenModule)
	}
	, {
		path: "workoutform",
		component: WorkoutFormComponent
	}
	, {
		path: "app-initial-weight",
		component: InitialWeightComponent
	},
	{
		path: "sessionFormComponent",
		component: SessionFormComponent
	},
	{
		path: "history",
		component: HistoryComponent
	},
	{
		path: "settings",
		component: SettingsComponent
	},
	{
		path: "exercise",
		component: ExerciseComponent
	},
	{
		path: "edit-exercise",
		component: EditExerciseComponent
	},
	{
		path: "muscle-groups",
		component: MuscleGroupsComponent
	},
	{
		path: "edit-muscle-group",
		component: EditMuscleGroupComponent
	},
	{
		path: "langhantel",
		component: LanghantelComponent
	},
	{
		path: "app-scheiben",
		component: ScheibenComponent
	},
	{
		path: "app-bodyweight",
		component: BodyweightComponent
	}
	
];
	
@NgModule({
		imports: [RouterModule.forRoot(routes)],
		exports: [RouterModule],
})

// @NgModule({
//   imports: [
//     RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
//   ],
//   exports: [RouterModule]
// })
export class AppRoutingModule {}
