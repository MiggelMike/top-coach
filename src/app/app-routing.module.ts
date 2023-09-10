import { InitialWeight } from './../Business/Uebung/InitialWeight';
import { ProgrammWaehlenModule } from './programm-waehlen/programm-waehlen.module';
import { ITrainingsProgramm } from "./../Business/TrainingsProgramm/TrainingsProgramm";
import { ProgrammWaehlenComponent } from "./programm-waehlen/programm-waehlen.component";
import { NgModule, inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from "@angular/router";
import { DexieSvcService } from "./services/dexie-svc.service";
import { WorkoutFormComponent } from "./bausteine/workout-form/workout-form.component";
import { InitialWeightComponent } from './initial-weight/initial-weight.component';



export const LadeStandardProgramme: ResolveFn<ITrainingsProgramm[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	return inject(DexieSvcService)
		.LadeStandardProgramme()
		.then((programme) => {
			return programme;
		});
};

const routes: Routes = [
	{
		path: "",
		loadChildren: () => import("./anstehende-sessions/anstehende-sessions/anstehende-sessions.module").then((m) => m.AnstehendeSessionsModule)
	}
	,{
		path: "programmwaehlen",
		resolve: { StandardProgramme: LadeStandardProgramme },
		loadChildren: () => import("../app/programm-waehlen/programm-waehlen.module").then((m) => m.ProgrammWaehlenModule)
	}
	, {
		path: "workoutform",
		component: WorkoutFormComponent
	}
	,{
		path: "app-initial-weight",
		component: InitialWeightComponent
//		loadChildren: () => import("../app/initial-weight/initial-weight.module").then((m) => m.InitialWeightModule)
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
