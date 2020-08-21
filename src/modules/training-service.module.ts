import { TrainingsProgrammSvc } from "./../app/services/trainings-programm-svc.service";
import {
    ModuleWithProviders,
    NgModule,
    Optional,
    SkipSelf,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
@NgModule({
    imports: [CommonModule],
    declarations: [TrainingsProgrammSvc],
    exports: [TrainingsProgrammSvc],
})
export class TrainingServiceModule {
    public x: number = 0;

    constructor(
        public trainingsProgrammSvc: TrainingsProgrammSvc,
        @Optional() @SkipSelf() parentModule?: TrainingServiceModule
    ) {
        if (parentModule) {
            throw new Error(
                "TrainingServiceModule is already loaded. Import it in the AppModule only"
            );
        }
    }

    public setX(val: number) {
        this.x = val;
    }

    public getX() {
        return this.x;
    }

    static forRoot(): ModuleWithProviders<TrainingServiceModule> {
        return {
            ngModule: TrainingServiceModule,
            providers: [TrainingsProgrammSvc],
        };
    }
}
