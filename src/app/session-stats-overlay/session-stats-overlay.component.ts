import { BodyWeight } from 'src/Business/Bodyweight/Bodyweight';
import { AppData } from './../../Business/Coach/Coach';
import { SessionOverlayConfig } from './../services/session-overlay-service.service';
import { ElementRef, ViewEncapsulation  } from '@angular/core';
import { XY_Position, ModalPositionService } from './../services/modal-position.service';
import { ISession, Session } from './../../Business/Session/Session';
import { Component, OnInit, Inject, InjectionToken, AfterViewInit,ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { cSessionStatsOverlayData, SessionOverlayRef } from '../services/session-overlay-service.service';
import { DexieSvcService } from '../services/dexie-svc.service';
import { DateFormatTyp, IDateFormatTyp } from 'src/Business/Datum';



@Component({
    selector: "app-session-stats-overlay",
    templateUrl: "./session-stats-overlay.component.html",
	styleUrls: ["./session-stats-overlay.component.scss"],
	encapsulation: ViewEncapsulation.None
})
	
export class SessionStatsOverlayComponent  implements AfterViewInit, OnInit , IDateFormatTyp{
    @ViewChild(TemplateRef) _ovelayTemplate: TemplateRef<any>;
    @ViewChild("anchorRef") anchorRef: any;
    public top: number;
    public left: number;
    public fAnchorMouseOffset: XY_Position;
	public fAnchorPosition: XY_Position;
	public fIsConstrained: boolean;
	public fPopupPosition: XY_Position;
    public fPopupRef!: ElementRef;
	public fConfig: SessionOverlayConfig;
	public showDuration: boolean = false;
	public AppData: AppData;

	datum: Date = new Date();
	
	constructor(
		public overlayRef: SessionOverlayRef,
		public _ModalPositionService: ModalPositionService,
		public fDexieService: DexieSvcService,
		@Inject(cSessionStatsOverlayData) public sess: ISession
	) {
		sess.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);

		this.fPopupPosition = {
			left: -1000,
			top: 400
		}


		this.fAnchorPosition = {
			left: 10,
			top: 400
		};
        
		this.fAnchorMouseOffset = {
			left: 0,
			top: 0
		};
        
		this.fIsConstrained = false;

		this.fDexieService.LadeAppData()
			.then((aAppData) => this.AppData = aAppData);
		
		// this.fDexieService.LadeSessionBodyweight(this.sess as Session)
		// 	.then((aBw) => {
		// 		if (this.sess.BodyWeightAtSessionStart === 0) {
		// 			if (aBw !== undefined) 
		// 				this.sess.BodyWeightAtSessionStart = aBw.Weight;
		// 			else
		// 				this.sess.BodyWeightAtSessionStart = 0;
		// 		}
		// 	});
	}
	get dateFormatTyp(): typeof DateFormatTyp {
		return DateFormatTyp;
	}
	
	get GewichtsEinheit(): string {
		if (this.AppData === undefined)
			return '';
		return this.AppData.GewichtsEinheitText;
	}

	onFocusBodyweight(aEvent: any) {
		aEvent.target.select();
	}

	SetBodyweight(aEvent: any) {
		this.sess.BodyWeight.Weight = Number(aEvent.target.value);
	}

    ngOnInit(): void { 
		this.showDuration = true;
		// this.overlayRef.offsetTop = 400;

    }
    
	ngAfterViewInit() { }
	
    
    close() {
        if(this.overlayRef != null)
            this.overlayRef.close();
        this.overlayRef = null!;
    }
}
