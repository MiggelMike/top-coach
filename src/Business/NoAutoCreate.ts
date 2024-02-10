export enum NoAutoCreateItem {
    GzclpProgram,
    HypertrophicSpecificProgram
    
}

export class NoAutoCreateDB{
    id: number;
    noAutoCreateTyp: NoAutoCreateItem;
}

export class NoAutoCreate{
    noAutoCreateDB: NoAutoCreateDB = new NoAutoCreateDB();
    //#region id
    get id(): number{
        return this.noAutoCreateDB.id;
    }
    set id(value: number) {
        this.noAutoCreateDB.id = value;
    }
    //#endregion
    //#region NoAutoCreateItem
    get noCreateItem(): NoAutoCreateItem {
        return this.noAutoCreateDB.noAutoCreateTyp;
    }
    set noCreateItem(value: NoAutoCreateItem) {
        this.noAutoCreateDB.noAutoCreateTyp = value;
    }
    //#endregion
}