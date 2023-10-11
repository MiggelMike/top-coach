import { HistoryModule } from './history/history.module';
import { HistoryComponent } from './history/history.component';
import { ITrainingsProgramm } from "./../Business/TrainingsProgramm/TrainingsProgramm";
import { NgModule, inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from "@angular/router";
import { DexieSvcService, ProgrammParaDB, SessionParaDB, UebungParaDB } from "./services/dexie-svc.service";
import { WorkoutFormComponent } from "./bausteine/workout-form/workout-form.component";
import { InitialWeightComponent } from './initial-weight/initial-weight.component';
import { AnstehendeSessionsComponent } from './anstehende-sessions/anstehende-sessions.component';
import { SessionFormComponent } from './bausteine/session-form/session-form.component';



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
		// resolve: { AktuellesProgramm: LadeAktuellesProgramm },
		component: AnstehendeSessionsComponent
		// loadChildren: () => import("./anstehende-sessions/anstehende-sessions/anstehende-sessions.module").then((m) => m.AnstehendeSessionsModule)
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
		//		loadChildren: () => import("../app/initial-weight/initial-weight.module").then((m) => m.InitialWeightModule)
	},
	{
		path: "sessionFormComponent",
		// loadComponent: () => import("../../src/app/bausteine/session-form/session-form.component").then((m) => m.SessionFormComponent)		
		//  loadChildren: () => import("../../src/app/bausteine/session-form/session-form.module").then((m) => {
		//  	return m.SessionFormModule;
		//  })		
		component: SessionFormComponent
	},
	{
		path: "history",
		// loadComponent: () => import("../../src/app/bausteine/session-form/session-form.component").then((m) => m.SessionFormComponent)		
		//  loadChildren: () => import("../../src/app/history/history.module").then((m) => {
		//  	return m.HistoryModule;
		//  })		
		component: HistoryComponent
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
