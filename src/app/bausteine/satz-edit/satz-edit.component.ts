import { Component, OnInit, Input } from "@angular/core";
import { ISatz } from './../../../Business/Satz/Satz';

@Component({
    selector: "app-satz-edit",
    templateUrl: "./satz-edit.component.html",
    styleUrls: ["./satz-edit.component.scss"],
})
export class SatzEditComponent implements OnInit {
  @Input() satz: ISatz;
    constructor() {}

  ngOnInit(): void { }

}
