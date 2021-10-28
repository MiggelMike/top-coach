import { Component, OnInit } from '@angular/core';
import { DialogeService } from '../services/dialoge.service';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Location } from '@angular/common'
import { Hantel } from 'src/Business/Hantel/Hantel';
import { DialogData } from '../dialoge/hinweis/hinweis.component';

@Component({
    selector: "app-edit-langhantel",
    templateUrl: "./edit-langhantel.component.html",
    styleUrls: ["./edit-langhantel.component.scss"],
})
export class EditLanghantelComponent implements OnInit {
    Hantel: Hantel;
    CmpHantel: Hantel;

    constructor(
        public fDialogService: DialogeService,
        public fDexieSvcService: DexieSvcService,
        private location: Location
    ) {}

    ngOnInit(): void {}

    back() {
        if (this.Hantel.isEqual(this.CmpHantel))
            this.location.back();
        else {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push("Cancel unsaved changes?");
            mDialogData.OkFn = (): void => this.location.back();

            this.fDialogService.JaNein(mDialogData);
        }
    }

    SaveChanges() {
        const mTmpEditHantelComponent: EditLanghantelComponent = this.ClickData as EditLanghantelComponent;
        mTmpEditHantelComponent.fDexieSvcService
            .HantelSpeichern(mTmpEditHantelComponent.Hantel)
            .then((mID) => {
                mTmpEditHantelComponent.Hantel.ID = mID;
                mTmpEditHantelComponent.Hantel = mTmpEditHantelComponent.Hantel.Copy();
                //mTmpEditHantelComponent.fDexieSvcService.LadeEquipment();
            });
    }

    CancelChanges() {
        const mTmpEditHantelComponent: EditLanghantelComponent = this.ClickData as EditLanghantelComponent;
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => {
            mTmpEditHantelComponent.Hantel = mTmpEditHantelComponent.CmpHantel.Copy();
        };

        mTmpEditHantelComponent.fDialogService.JaNein(mDialogData);
    }
}
