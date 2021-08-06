import { formatNumber } from '@angular/common';

export class MaxZeitraum{
    public Stunden: number = 0;
    public Minuten: number = 0;
    public Sekunden: number = 0;

    constructor(aStunden: number, aMinuten: number, aSekunden: number) {
        this.Stunden = aStunden;
        this.Minuten = aMinuten;
        this.Sekunden = aSekunden;
    }
}

export class ZeitraumDB {
    Von: Date;
    Bis: Date;
    MaxDatum: Date;
    MaxDauer: number;
}


export class Zeitraum extends ZeitraumDB  {
   
    public DauerRaw(): number {
        const mResult = Zeitraum.CalcDauer(this.Von, this.Bis);
        if (mResult >= this.MaxDauer)
            return mResult;
        return this.MaxDauer;
    }

    public DauerFormated(): string {
        return Zeitraum.FormatDauer(this.DauerRaw());
    }

    public static CalcDauer(aVonZeitpunkt: Date, aBisZeitpunkt: Date): number {
        const mDauer =
            Math.floor((
                Date.UTC(
                    aBisZeitpunkt.getFullYear(),
                    aBisZeitpunkt.getMonth(),
                    aBisZeitpunkt.getDate(),
                    aBisZeitpunkt.getHours(),
                    aBisZeitpunkt.getMinutes(),
                    aBisZeitpunkt.getSeconds()
                ) -
                Date.UTC(
                    aVonZeitpunkt.getFullYear(),
                    aVonZeitpunkt.getMonth(),
                    aVonZeitpunkt.getDate(),
                    aVonZeitpunkt.getHours(),
                    aVonZeitpunkt.getMinutes(),
                    aVonZeitpunkt.getSeconds()
                )) / 1000);
        
        return mDauer;
    }

    public static FormatDauer(aSekundenTotal: number): string {
        // "parseInt((a/b).toString())" entspricht einer ganzzahligen Divison
       
        // Stunden
        const mStundenInt = parseInt((aSekundenTotal / 3600).toString());
        const mStunden: string = formatNumber(mStundenInt, 'en-US', '2.0-0');
        // // Minuten
        const mMinutenInt: number = parseInt(((aSekundenTotal / 60) % 60).toString());
        const mMinuten: string = formatNumber(mMinutenInt, 'en-US', '2.0-0');
        // // Sekunden
        const mSekunden: string = formatNumber(aSekundenTotal % 60, 'en-US', '2.0-0');
        return mStunden + ':' + mMinuten + ':' + mSekunden;
    }

    
    constructor(aVon: Date, aBis: Date, aMaxDauer: MaxZeitraum = new MaxZeitraum(99, 59, 59)) {
        super();
        this.Von = aVon;
        this.Bis = aBis;
        this.MaxDatum = new Date();
        this.MaxDatum.setUTCHours(this.MaxDatum.getUTCHours() + aMaxDauer.Stunden);
        this.MaxDatum.setUTCMinutes(this.MaxDatum.getUTCMinutes() + aMaxDauer.Minuten);
        this.MaxDatum.setUTCSeconds(this.MaxDatum.getUTCSeconds() + aMaxDauer.Sekunden);
        this.MaxDauer = Zeitraum.CalcDauer(this.Von, this.MaxDatum);
    }
}
