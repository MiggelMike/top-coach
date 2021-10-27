import { Equipment } from './../../Business/Equipment/Equipment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogeService } from '../services/dialoge.service';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Location } from '@angular/common'
import { DialogData } from '../dialoge/hinweis/hinweis.component';


@Component({
  selector: 'app-edit-equipment',
  templateUrl: './edit-equipment.component.html',
  styleUrls: ['./edit-equipment.component.scss']
})
export class EditEquipmentComponent implements OnInit {

    public Equipment: Equipment = null;
    public CmpEquipment: Equipment = null;
    public get EquipmentTypListe(): Array<string> {
        return this.fDexieSvcService.EquipmentTypListeSorted;
    }
    

    constructor(
        private router: Router,
        public fDialogService: DialogeService,
        public  fDexieSvcService: DexieSvcService,
        private location: Location)
    {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { equ: Equipment; };
        this.Equipment = mState.equ.Copy();
        this.CmpEquipment = mState.equ.Copy();
    }

    ngOnInit(): void {
    }
    
    back() {
        if (this.Equipment.isEqual(this.CmpEquipment))
            this.location.back();
        else {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push("Cancel unsaved changes?");
            mDialogData.OkFn = (): void => this.location.back();

            this.fDialogService.JaNein(mDialogData);
        }
    }

    SaveChanges() {
        const mTmpEditEquipmentComponent: EditEquipmentComponent = (this.ClickData as EditEquipmentComponent);
        mTmpEditEquipmentComponent.fDexieSvcService.MuskelgruppeSpeichern(mTmpEditEquipmentComponent.Muskelgruppe)
            .then(mID => {
                mTmpEditEquipmentComponent.Equipment.ID = mID;
                mTmpEditEquipmentComponent.CmpEquipment = mTmpEditEquipmentComponent.Equipment.Copy();
                mTmpEditEquipmentComponent.fDexieSvcService.LadeEquipment();
            }
            );
        
    }

    CancelChanges() {
        const mTmpEditEquipmentComponent: EditEquipmentComponent = (this.ClickData as EditEquipmentComponent);
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => { mTmpEditEquipmentComponent.Equipment = mTmpEditEquipmentComponent.CmpEquipment.Copy(); }
        
        mTmpEditEquipmentComponent.fDialogService.JaNein(mDialogData);
    }

}
