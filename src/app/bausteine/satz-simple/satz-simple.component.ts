import { ISatzStatus, Satz, SatzStatus } from './../../../Business/Satz/Satz';
import { Component, OnInit, Input } from "@angular/core";

@Component({
	selector: 'app-satz-simple',
	templateUrl: './satz-simple.component.html',
	styleUrls: ['./satz-simple.component.scss'],
	// styles: [
	//     `
	//     :host {
	//       display: block;
	//       margin: 2px;
	//     }
	//     `,
	// ]
})
export class SatzSimpleComponent implements OnInit, ISatzStatus {
	@Input() satz: Satz;
	constructor() {}

	get satzStatus(): typeof SatzStatus {
		return SatzStatus;
	}

	ngOnInit(): void {}

	ngAfterViewInit() {
		const x = 0;
	}
}

