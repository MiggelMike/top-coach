import { floatMask } from 'src/app/app.module';
import { AppData } from './../../Business/Coach/Coach';
import { SessionOverlayConfig } from './../services/session-overlay-service.service';
import { ElementRef  } from '@angular/core';
import { XY_Position, ModalPositionService } from './../services/modal-position.service';
import { ISession } from './../../Business/Session/Session';
import { Component, OnInit, Inject, InjectionToken, AfterViewInit,ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { cSessionStatsOverlayData, SessionOverlayRef } from '../services/session-overlay-service.service';
import { DexieSvcService } from '../services/dexie-svc.service';



@Component({
    selector: "app-session-stats-overlay",
    templateUrl: "./session-stats-overlay.component.html",
    styleUrls: ["./session-stats-overlay.component.scss"],
})
export class SessionStatsOverlayComponent  implements AfterViewInit, OnInit {
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
	public floatMask = floatMask;
	
    constructor(
        public overlayRef: SessionOverlayRef,
		public _ModalPositionService: ModalPositionService,
		public fDexieService: DexieSvcService,
        @Inject(cSessionStatsOverlayData) public sess: ISession
	) {
		sess.PruefeGewichtsEinheit(this.fDexieService.AppRec.GewichtsEinheit);

        this.fAnchorPosition = {
			left: 10,
			top: 120
        };
        
		this.fAnchorMouseOffset = {
			left: 0,
			top: 0
        };
        
		this.fIsConstrained = false;
		
		this.fDexieService.LadeAppData()
			.then((aAppData) => this.AppData = aAppData);
		
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
		this.sess.BodyWeight =  Number(aEvent.target.value);
	}

    public handleMousedown( event: MouseEvent ) : void {
		event.preventDefault();
		var anchorRect = this.anchorRef.nativeElement.getBoundingClientRect();
		this.fAnchorMouseOffset.left = ( event.clientX - anchorRect.left );
		this.fAnchorMouseOffset.top = ( event.clientY - anchorRect.top );
		window.addEventListener( "mousemove", this.handleMousemove );
		window.addEventListener( "mouseup", this.handleMouseup );

	}

    public handleMouseup = (): void => {
        var anchorRect = this.anchorRef.nativeElement.getBoundingClientRect();
		window.removeEventListener( "mousemove", this.handleMousemove );
		window.removeEventListener( "mouseup", this.handleMouseup );
        this.fConfig.left = anchorRect.left; 
        this.fConfig.top = anchorRect.top; 
		this.fPopupPosition.left = -1000;
		this.fPopupPosition.top = -1000;
	}

    public handleMousemove = ( event: MouseEvent ): void => {
		this.fAnchorPosition.left = ( event.clientX - this.fAnchorMouseOffset.left + window.pageXOffset );
		this.fAnchorPosition.top = ( event.clientY - this.fAnchorMouseOffset.top + window.pageYOffset );
		var popupRect = this.fPopupRef.nativeElement.getBoundingClientRect();
		var popupWidth = popupRect.width;
		var popupHeight = popupRect.height;
		var windowWidth = document.documentElement.clientWidth;
		var windowHeight = document.documentElement.clientHeight;
		var naturalLeft = ( this.fAnchorPosition.left - window.pageXOffset );
		var naturalTop = ( this.fAnchorPosition.top + 40 - window.pageYOffset );
		var minLeft = 10;
		var maxLeft = ( windowWidth - popupWidth - 10 );
		// var minTop = 10;
		var maxTop = ( windowHeight - popupHeight - 10 );
		this.fPopupPosition.left = Math.min( naturalLeft, maxLeft );
		this.fPopupPosition.left = Math.max( minLeft, this.fPopupPosition.left );
		this.fPopupPosition.top = Math.min( naturalTop, maxTop );
		this.fPopupPosition.top = Math.max( minLeft, this.fPopupPosition.top );

		this.fIsConstrained = (
			( this.fPopupPosition.left !== naturalLeft ) ||
			( this.fPopupPosition.top !== naturalTop )
        );
       
	}


    ngOnInit(): void { 
		this.showDuration = true;
    }
    
	ngAfterViewInit() { }
	
    
    close() {
        if(this.overlayRef != null)
            this.overlayRef.close();
        this.overlayRef = null;
    }
}
