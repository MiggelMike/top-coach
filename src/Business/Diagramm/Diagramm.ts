import { Satz } from "../Satz/Satz";

export class DiaUebungSettings{
	public ID: number;
	public UebungID: number = 0;
    public UebungName: string = '';
	public Visible: boolean = true;
	public Relevant: boolean = true;
}

export class DiaUebung extends DiaUebungSettings {
	ArbeitsSatzListe: Array<Satz> = [];

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