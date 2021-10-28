import { Component, OnInit } from '@angular/core';
import { Hantel } from 'src/Business/Hantel/Hantel';
import { Router } from '@angular/router';
import { DexieSvcService } from '../services/dexie-svc.service';

@Component({
    selector: "app-langhantel",
    templateUrl: "./langhantel.component.html",
    styleUrls: ["./langhantel.component.scss"],
})
export class LanghantelComponent implements OnInit {
    constructor(
        private fDexieSvcService: DexieSvcService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    get LanghantelListSortedByName(): Array<Hantel> {
        return this.fDexieSvcService.LanghantelListeSortedByName;
    }

    public EditLanghantel(aHantel: Hantel): void {
        this.router.navigate(["/edit-langhantel"], { state: { hantel: aHantel} });
    }
}
