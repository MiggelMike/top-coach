import { formatNumber } from "@angular/common";
import { cWeightFormat } from "src/app/services/dexie-svc.service";

export class InitialWeight {
    UebungID: number = 0;
    Name: string;
    Weight: number = 0;
    get WeightText(): string{
        return formatNumber(this.Weight,'en-US',cWeightFormat);
    }
}


