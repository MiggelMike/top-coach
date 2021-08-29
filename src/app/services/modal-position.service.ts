import { Injectable, Type } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalPositionService {

    constructor() { }
    
        private _cache = new Map<Type<any>, Position>();
      
        set(dialog: Type<any>, position: Position) {
          this._cache.set(dialog, position);
        }
      
        get(dialog: Type<any>): Position|null {
          return this._cache.get(dialog);
        }
}
