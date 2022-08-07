import { Satz } from "../Satz/Satz";

export class DiaUebung {
	UebungID: number = 0;
    UebungName: string = '';
	ArbeitsSatzListe: Array<Satz> = [];
	Visible: Boolean = true;

	get MaxWeight(): number {
		if (this.ArbeitsSatzListe.length === 0)
			return 0;

		this.ArbeitsSatzListe.sort((s1, s2) => {
			return s2.GewichtAusgefuehrt - s1.GewichtAusgefuehrt;
		});

		return this.ArbeitsSatzListe[0].GewichtAusgefuehrt;
	}
}

export class DiaDatum {
	Datum: Date;
	DiaUebungsListe: Array<DiaUebung> = [];
}