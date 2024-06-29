// import { floatMask, repMask, Int2DigitMask } from './../app.module';
import { ViewChild, Component, ElementRef, OnInit } from '@angular/core';
import { DialogeService } from '../services/dialoge.service';
import { DexieSvcService } from '../services/dexie-svc.service';
import { Location } from '@angular/common'
import { Hantel, HantelTyp, LanghantelTyp } from 'src/Business/Hantel/Hantel';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { Router } from '@angular/router';

@Component({
    selector: "app-edit-langhantel",
    templateUrl: "./edit-langhantel.component.html",
    styleUrls: ["./edit-langhantel.component.scss"],
})
export class EditLanghantelComponent implements OnInit {
    Hantel: Hantel; 
    CmpHantel: Hantel;
    SelectedTyp: HantelTyp; 
    // public floatMask = floatMask;
    // public repMask = repMask;    
    // public Int2DigitMask = Int2DigitMask;
    public ClickData: EditLanghantelComponent;
    @ViewChild('Name') NameField: ElementRef;

    constructor(
        public fDialogService: DialogeService,
        public fDexieSvcService: DexieSvcService,
        private location: Location,
        private router: Router
    ) {
        const mNavigation = this.router.getCurrentNavigation();
        const mState = mNavigation.extras.state as { hantel: Hantel; };
        this.Hantel = mState.hantel.Copy();
        this.CmpHantel = mState.hantel.Copy();
    }
    
    ngAfterViewInit() {
        this.NameField.nativeElement.focus();   
    }

    ngOnChanges() {
        
        this.SelectedTyp = this.Hantel.Typ;
    }
    
    ngOnInit(): void {
    }

    back() {
        if(this.Hantel.isEqual(this.CmpHantel)) this.location.back();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
			
			mDialogData.OkFn = (): void => {
				this.SaveChanges();
			}

			mDialogData.CancelFn = (): void => {
				const mCancelDialogData = new DialogData();
				mCancelDialogData.textZeilen.push("Changes will be lost!");
				mCancelDialogData.textZeilen.push("Are you shure?");
				mCancelDialogData.OkFn = (): void => this.location.back();
				this.fDialogService.JaNein(mCancelDialogData);
			}

			this.fDialogService.JaNein(mDialogData);
		}



        // if (this.Hantel.isEqual(this.CmpHantel))
        //     this.location.back();
        // else {
        //     const mDialogData = new DialogData();
        //     mDialogData.textZeilen.push("Cancel unsaved changes?");
        //     mDialogData.OkFn = (): void => this.location.back();

        //     this.fDialogService.JaNein(mDialogData);
        // }
    }

    SaveChanges() {
        this.fDexieSvcService
            .HantelSpeichern(this.Hantel)
            .then((mID) => {
                this.location.back();
            });
    }

    CancelChanges() {
        const mTmpEditHantelComponent: EditLanghantelComponent = this.ClickData as EditLanghantelComponent;
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push("Cancel unsaved changes?");
        mDialogData.OkFn = (): void => { mTmpEditHantelComponent.Hantel = mTmpEditHantelComponent.CmpHantel.Copy();
        };

        mTmpEditHantelComponent.fDialogService.JaNein(mDialogData);
    }

    public get LanghantelTypListe(): Array<LanghantelTyp>{
        return LanghantelTyp.StaticLanghantelTypListe();
    }
    
}
