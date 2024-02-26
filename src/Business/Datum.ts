export enum DateFormatTyp {
	Komplett,
	Datum,
    Zeit,
    KomplettOhneSekunden
}

export interface IDateFormatTyp {
	get dateFormatTyp(): (typeof DateFormatTyp);
}

export class Datum {
    public static StaticFormatDate(aDate: Date, aDateFormatTyp: DateFormatTyp = DateFormatTyp.Komplett): string {
        if (aDate === undefined)
            return '';
        
        switch (aDateFormatTyp) {
            case DateFormatTyp.Zeit:
                return aDate.toLocaleTimeString();
                break;
            case DateFormatTyp.Datum:
                return aDate.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
                break;
            case DateFormatTyp.Komplett:
                return aDate.toLocaleDateString();
                break;
            default:
                return aDate.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                break;
        }
    }
    
    public static StaticParseDatum(aDateText: string, aDefault: Date): Date {
        try {
            return new Date(Date.parse(aDateText));
        } catch {
            try {
                return new Date(Date.parse(aDateText + ' 00:00:00'));
            } catch {
                return aDefault;
            }
        }
    }

    public static StaticAddDays(aDatum: Date, aTage: number): Date {
        return new Date(aDatum.getTime() + aTage * 24 * 60 * 60 * 1000);
    }
    
    public static StaticAddSeconds(aDatum: Date, aSeconds: number): Date {
        return new Date(aDatum.getTime() + aSeconds * 1000);
    }

}