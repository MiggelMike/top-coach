import { Injectable, Type } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
export class ModalPositionService {

    constructor() { }
    
        private _cache = new Map<Type<any>, XY_Position>();
      
        set(dialog: Type<any>, position: XY_Position) {
          this._cache.set(dialog, position);
        }
      
        get(dialog: Type<any>): XY_Position|null {
          return this._cache.get(dialog);
        }
}

export interface XY_Position {
    left: number;
	top: number;
}
