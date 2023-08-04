import { ITrainingsProgramm } from "./../Business/TrainingsProgramm/TrainingsProgramm";
import { ProgrammWaehlenComponent } from "./programm-waehlen/programm-waehlen.component";
import { NgModule, inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from "@angular/router";
import { DexieSvcService } from "./services/dexie-svc.service";
import { WorkoutFormComponent } from "./bausteine/workout-form/workout-form.component";

export const LadeStandardProgramme: ResolveFn<ITrainingsProgramm[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	return inject(DexieSvcService)
		.LadeStandardProgramme()
		.then((programme) => {
			return programme;
		});
};

const routes: Routes = [
	{
		path: "programmwaehlen",
		component: ProgrammWaehlenComponent,
		resolve: { StandardProgramme: LadeStandardProgramme },
	}
	,{ path: "", loadChildren: () => import("./anstehende-sessions/anstehende-sessions/anstehende-sessions.module").then((m) => m.AnstehendeSessionsModule) }
	// ,{ path: "workoutform", loadChildren: () => import("../app/bausteine/workout-form/workout-form.module").then((m) => m.WorkoutFormModule) }
	, { path: "workoutform", component: WorkoutFormComponent }
	
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
