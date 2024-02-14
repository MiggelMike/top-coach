// Beim ersten Start des Programms werden einige Standards angelegt. (Z.B. Workouts)
// Falls diese vom Anwender gelöscht werden, wird ein Eintrag in der Tabelle NoAutoCreateDB erzeugt.
// Dadurch wird verhindert, dass beim nächsten Start des Programms dieser Standard erneut angelegt wird.

export enum NoAutoCreateItem {
    GzclpProgram,
    HypertrophicSpecificProgram,
    ExamplePrograms
    
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