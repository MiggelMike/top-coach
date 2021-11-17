import { ErstellStatus } from './../services/dexie-svc.service';
import { Component, OnInit } from '@angular/core';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Router } from '@angular/router';
import { MuscleGroup, MuscleGroupKategorie01 } from 'src/Business/MuscleGroup/MuscleGroup';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { DialogeService } from '../services/dialoge.service';

@Component({
  selector: 'app-muscle-groups',
  templateUrl: './muscle-groups.component.html',
  styleUrls: ['./muscle-groups.component.scss']
})
export class MuscleGroupsComponent implements OnInit {

    public NeueMuskelgruppe: MuscleGroup = null;
    public Status: ErstellStatus = ErstellStatus.VomAnwenderErstellt;
    MuscelListe: Array<MuscleGroup> = [];
    CmpMuscelListe: Array<MuscleGroup> = [];

    constructor(private fDexieSvcService: DexieSvcService,
                public fDialogService: DialogeService,
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
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Delete record?");
        mDialogData.OkFn = (): void => (this.DeletePrim(aMuskelGruppe));
        this.fDialogService.JaNein(mDialogData);
    }

    private DeletePrim(aMuskelGruppe: MuscleGroup) {
        if (aMuskelGruppe.Status === ErstellStatus.AutomatischErstellt) {
            // Automatisch erstellte nicht löschen, sonder auf "Geloescht" setzen,
            // sonst werden sie beim Programm-Start wieder erzeugt.
            aMuskelGruppe.Status = ErstellStatus.Geloescht;
            this.fDexieSvcService.MuskelgruppeSpeichern(aMuskelGruppe)
                .then(() => (this.fDexieSvcService.LadeMuskelGruppen(() => this.CopyMuskelList())));
        } else {
            this.fDexieSvcService.MuskelGruppeTable.delete(aMuskelGruppe.ID)
                .then(() => (this.fDexieSvcService.LadeMuskelGruppen(() => this.CopyMuskelList())));
        }
    }

    get MuskelListeSortedByName(): Array<MuscleGroup> {
        return this.fDexieSvcService.MuskelListeSortedByName(true);
    }

    private CopyMuskelList() {
        this.MuscelListe = [];
        this.CmpMuscelListe = [];
        for (let index = 0; index < this.MuskelListeSortedByName.length; index++
        ) {
            this.MuscelListe.push(this.MuskelListeSortedByName[index].Copy());
            this.CmpMuscelListe.push(this.MuskelListeSortedByName[index].Copy());
        }
    }

}
