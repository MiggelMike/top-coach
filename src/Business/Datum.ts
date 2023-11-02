export enum DateFormatTyp {
	Komplett,
	Datum,
    Zeit,
    KomplettOhneSekunden
}

export interface IDateFormatTyp {
	get dateFormatTyp(): (typeof DateFormatTyp);
}

export class Datum{
    public static StaticFormatDate(aDate: Date, aDateFormatTyp: DateFormatTyp = DateFormatTyp.Komplett): string {
        switch (aDateFormatTyp) {
            case DateFormatTyp.Zeit:
                return aDate.toLocaleTimeString();
                break;
            case DateFormatTyp.Datum:
                return aDate.toLocaleDateString()
                break;
            case DateFormatTyp.Komplett:
                return aDate.toLocaleDateString() + ' ' + aDate.toLocaleTimeString();
                break;
            default:
                return aDate.toLocaleDateString() + ' ' + aDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                break;
        }
	}
}