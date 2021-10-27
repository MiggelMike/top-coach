import { Equipment } from './../../Business/Equipment/Equipment';
import { Component, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {

    constructor(private fDexieSvcService: DexieSvcService,
                private router: Router) { }

    ngOnInit(): void {}

    public get EquipmentListSortedByName(): Array<Equipment> {
        return this.fDexieSvcService.EquipmentListSortedByDisplayName;
    }

    public EditEquipment(aEquipment: Equipment): void {
        this.router.navigate(["/edit-equipment"], { state: { equ: aEquipment} });
    }
}
