import { Component, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Router } from '@angular/router';
import { MuscleGroup } from 'src/Business/MuscleGroup/MuscleGroup';

@Component({
  selector: 'app-muscle-groups',
  templateUrl: './muscle-groups.component.html',
  styleUrls: ['./muscle-groups.component.scss']
})
export class MuscleGroupsComponent implements OnInit {

  constructor(private fDexieSvcService : DexieSvcService,  private router: Router) { }

  ngOnInit(): void {
  }
    
    public get MuskelGruppenListe() {
        return this.fDexieSvcService.MuskelgruppeListeSortedByName;
    }

    public EditMuskelGruppe(aMuskelGruppe: MuscleGroup): void {
        this.router.navigate(["/edit-muscle-group"], { state: { mg: aMuskelGruppe} });
    }

}
