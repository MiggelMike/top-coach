import { Component, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Router } from '@angular/router';
import { MuscleGroup, MuscleGroupKategorie01 } from 'src/Business/MuscleGroup/MuscleGroup';

@Component({
  selector: 'app-muscle-groups',
  templateUrl: './muscle-groups.component.html',
  styleUrls: ['./muscle-groups.component.scss']
})
export class MuscleGroupsComponent implements OnInit {

    public NeueMuskelgruppe: MuscleGroup = null; 

    constructor(private fDexieSvcService: DexieSvcService,
                private router: Router) { }

  ngOnInit(): void {
  }
    
    public get MuskelGruppenListe() {
        return this.fDexieSvcService.MuskelgruppeListeSortedByName;
    }

    public EditMuskelGruppe(aMuskelGruppe: MuscleGroup): void {
        this.router.navigate(["/edit-muscle-group"], { state: { mg: aMuskelGruppe} });
    }

    public NeueMuskelGruppe(): void {
        this.NeueMuskelgruppe = new MuscleGroup();
        this.NeueMuskelgruppe.MuscleGroupKategorie01 = MuscleGroupKategorie01.Anwender;
        this.router.navigate(["/edit-muscle-group"], { state: { mg: this.NeueMuskelgruppe } });
    }
    
    public DeleteMuskel(aMuskelGruppe: MuscleGroup){

    }

}
