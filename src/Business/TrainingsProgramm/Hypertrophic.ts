import { ITrainingsProgramm, ProgrammKategorie, ProgrammTyp, TrainingsProgramm } from "./TrainingsProgramm";
import { deserialize } from '@peerlancers/json-serialization';
import { Progress } from '../Progress/Progress';
import { ISession, Session } from "../Session/Session";
import { StandardUebung, StandardUebungsName, Uebung, UebungsKategorie02 } from "../Uebung/Uebung";
import { LiftTyp, Satz, SatzTyp } from "../Satz/Satz";
import { DexieSvcService } from "src/app/services/dexie-svc.service";


export class HypertrophicProgramm extends TrainingsProgramm {
	constructor(aProgrammKategorie: ProgrammKategorie, public override pDbModule: DexieSvcService) {
		super(ProgrammTyp.HypertrophicSpecific, aProgrammKategorie, pDbModule);
		this.MaxSessions = 18;
	}

	public PreCopy(): ITrainingsProgramm {
		return new HypertrophicProgramm(this.ProgrammKategorie, this.pDbModule);
	}

	public override DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
		const s = deserialize(HypertrophicProgramm, aJsonData);
		return s;
	}

	protected override InitSession(aSessionNr: number): Array<ISession> {
		const mSessions = new Array<ISession>();
		const mNeueSession = new Session();
		const mSessionNr = aSessionNr + 1;
		mNeueSession.Name = `Day #${mSessionNr}`;
		mNeueSession.SessionNr = aSessionNr;
		mNeueSession.Datum = null;
		mNeueSession.ListenIndex = aSessionNr;

		mSessions.push(mNeueSession);
		this.ErzeugeSession(
			[
				StandardUebung.getStandardUebung(StandardUebungsName.Squat).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.StandingLegCurls).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.Benchpress).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.PullUps).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.OverheadPress).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.NeckExtensions).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.NeckCurls).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.ChinUps).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.Dips).Name,
				StandardUebung.getStandardUebung(StandardUebungsName.CalfRaises).Name
			],
			mNeueSession
		);
		return mSessions;
	}

	private ErzeugeSession(
		aUebungsNamenListe: Array<string>,
		aNeueSession: Session
	): void {
		const mAnzahlWdh: Array<number> = [15, 10, 5];
		let mAnzahlWdhIndex = 0;
		if (aNeueSession.SessionNr % 6 === 0)
			mAnzahlWdhIndex++;
			
		let mAkuelleAnzahlWdh = mAnzahlWdh[mAnzahlWdhIndex];

		for (let index = 0; index < aUebungsNamenListe.length; index++) {
			const mPtrUebung: Uebung = Uebung.StaticKopiere(this.pDbModule.SucheUebungPerName(aUebungsNamenListe[index]), UebungsKategorie02.Session);
			mPtrUebung.GewichtSteigerung = 1;
			mPtrUebung.GewichtReduzierung = 1;

			const mProgress = this.pDbModule.ProgressListe.find((p: Progress) => p.Name === Progress.cStandardProgress);
			if (mProgress !== undefined)
				mPtrUebung.FkProgress = mProgress.ID;
			
			// Arbeits-Saetze anfügen
			for (let i = 0; i < 2; i++) {
				mPtrUebung.SatzListe.push(
					Satz.NeuerSatz(
						SatzTyp.Training,
						LiftTyp.Normal,
						mAkuelleAnzahlWdh, // Von-Wdh-Vorgabe
						mAkuelleAnzahlWdh, // Bis-Wdh-Vorgabe
						100, // Prozent
						0, // SessionID
						0, // UebungID
						false // Kein AMRAP
					)
				);
			}//for
			aNeueSession.addUebung(mPtrUebung);
		}
	}

	public static ErzeugeHypertrophicVorlage(aDbModule: DexieSvcService): ITrainingsProgramm {
		const mHyperTrophicVorlage: ITrainingsProgramm = new HypertrophicProgramm(ProgrammKategorie.Vorlage, aDbModule);
		mHyperTrophicVorlage.Name = "Hypertrophic - Standard";
		const mSessions: Array<ISession> = new Array<ISession>();
		mHyperTrophicVorlage.Init(mSessions);
		return mHyperTrophicVorlage;
	}

}