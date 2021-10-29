import { isDefined } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { Hantel } from 'src/Business/Hantel/Hantel';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DialogeService } from '../services/dialoge.service';
import { floatMask, repMask, Int2DigitMask } from './../app.module';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { Location } from '@angular/common';

@Component({
    selector: "app-langhantel",
    templateUrl: "./langhantel.component.html",
    styleUrls: ["./langhantel.component.scss"],
})
export class LanghantelComponent implements OnInit {
    public floatMask = floatMask;
    public repMask = repMask;
    public Int2DigitMask = Int2DigitMask;
    HantelListe: Array<Hantel> = [];
    CmpHantelListe: Array<Hantel> = [];

    constructor(
        private fDexieSvcService: DexieSvcService,
        public fDialogService: DialogeService,
        private location: Location
    ) {
        this.CopyHantelList();
    }

    private CopyHantelList() {
        this.HantelListe = [];
        this.CmpHantelListe = [];
        for (let index = 0; index < this.LanghantelListSortedByName.length; index++
        ) {
            this.HantelListe.push(this.LanghantelListSortedByName[index].Copy());
            this.CmpHantelListe.push(this.LanghantelListSortedByName[index].Copy());
        }
    }

    ngOnInit(): void {}

    get LanghantelListSortedByName(): Array<Hantel> {
        return this.fDexieSvcService.LanghantelListeSortedByName;
    }

    private ChangesExist(): Boolean {
        if (this.HantelListe.length !== this.CmpHantelListe.length)
            return true;

        for (let index = 0; index < this.HantelListe.length; index++) {
            const mHantel = this.HantelListe[index];
            if (isDefined(mHantel.ID) === false)
                return true;

            const mCmpHantel = this.CmpHantelListe.find((h) => h.ID === mHantel.ID);
            if (isDefined(mHantel.ID) === false)
                return true;

            if (mHantel.isEqual(mCmpHantel) === false)
                return true;
        }
        return false;
    }

    back() {
        const mTmpEditHantelComponent: LanghantelComponent = this;
        if (mTmpEditHantelComponent.ChangesExist() === false)
        mTmpEditHantelComponent.location.back();
        else {
            const mDialogData = new DialogData();
            mDialogData.textZeilen.push("Cancel unsaved changes?");
            mDialogData.OkFn = (): void => mTmpEditHantelComponent.location.back();

            mTmpEditHantelComponent.fDialogService.JaNein(mDialogData);
        }
    }

    SaveChanges(aTmpEditHantelComponent: LanghantelComponent) {
        const mTmpEditHantelComponent: LanghantelComponent = this.ClickData as LanghantelComponent;;
        mTmpEditHantelComponent.fDexieSvcService
            .InsertHanteln(mTmpEditHantelComponent.HantelListe)
            .then((mDummy) => (mTmpEditHantelComponent.fDexieSvcService.LadeLanghanteln(() => mTmpEditHantelComponent.CopyHantelList())));
    }

    CancelChanges() {
        const mTmpEditHantelComponent: LanghantelComponent = this.ClickData as LanghantelComponent;
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => (mTmpEditHantelComponent.CopyHantelList());
        mTmpEditHantelComponent.fDialogService.JaNein(mDialogData);
    }
}
