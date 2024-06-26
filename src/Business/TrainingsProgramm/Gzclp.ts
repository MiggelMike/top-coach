import { DexieSvcService } from './../../app/services/dexie-svc.service';
import {
  StandardUebung,
  StandardUebungsName,
  Uebung,
  UebungsKategorie02,
} from './../Uebung/Uebung';
import {
  ProgrammKategorie,
  ProgrammTyp,
  TrainingsProgramm,
  ITrainingsProgramm,
} from './TrainingsProgramm';
import { ISession, Session } from '../Session/Session';

import {
    Satz,
    SatzTyp,
    SatzStatus,
    SatzPausen,
    LiftTyp,
} from '../Satz/Satz';

import { deserialize } from '@peerlancers/json-serialization';
import { Progress } from '../Progress/Progress';

export class GzclpProgramm extends TrainingsProgramm {
	constructor(aProgrammKategorie: ProgrammKategorie, public pDbModule: DexieSvcService) {
		super();
		this.ProgrammKategorie = aProgrammKategorie;
		this.ProgrammTyp = ProgrammTyp.Gzclp;
		// super(ProgrammTyp.Gzclp, aProgrammKategorie, pDbModule);
		this.MaxSessions = 4;
	}

	public PreCopy(): ITrainingsProgramm {
		return new GzclpProgramm(this.ProgrammKategorie, this.pDbModule);
	}

	public override DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
		const s = deserialize(GzclpProgramm, aJsonData);
		return s;
	}

	protected override InitSession(aSessionNr: number): Array<ISession> {
		const mSessions = new Array<ISession>();
		const mNeueSession = new Session();
		const mSessionNr = aSessionNr + 1;
		mNeueSession.Name = `Day #${mSessionNr}  --- `;
		// `0${month}
		switch (aSessionNr) {
			case 0:
				mNeueSession.Name += "Squat";
				break;

			case 1:
				mNeueSession.Name += "Overhead-Press";
				break;

			case 2:
				mNeueSession.Name += "Bench-Press";
				break;

			case 3:
				mNeueSession.Name += "Deadlift";
				break;
			default:
				break;
		}

		mNeueSession.SessionNr = aSessionNr;
		mNeueSession.Datum = null;
		mNeueSession.ListenIndex = aSessionNr;

		mSessions.push(mNeueSession);

		switch (aSessionNr) {
			case 0:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.Squat).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Benchpress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Dips).Name,
					mNeueSession
				);
				break;

			case 1:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.OverheadPress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Deadlift).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.ChinUps).Name,
					mNeueSession
				);
				break;

			case 2:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.Benchpress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Squat).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Dips).Name,
					mNeueSession
				);
				break;

			case 3:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.Deadlift).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.OverheadPress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.ChinUps).Name,
					mNeueSession
				);
				break;
		}
		return mSessions;
	}

	private ErzeugeSessions(aT1Uebung: string, aT2Uebung: string, aT3Uebung: string, aNeueSession: Session): void {
		// T1-Lift
		let mUebung: Uebung = Uebung.StaticKopiere(
			this.pDbModule,
			this.pDbModule.SucheUebungPerName(aT1Uebung),
			UebungsKategorie02.Session
		);
		mUebung.GewichtSteigerung = 1;
		mUebung.GewichtReduzierung = 1;

		const mProgress = DexieSvcService.ProgressListe.find((p) => p.Name === Progress.cStandardProgress);
		if (mProgress !== undefined)
			mUebung.FkProgress = mProgress.ID;
		
		// Arbeits-Saetze anfügen
		let mAnzSaetze = 5;
		for (let i = 0; i < mAnzSaetze; i++) {
			mUebung.SatzListe.push(
				Satz.NeuerSatz(
					SatzTyp.Training,
					LiftTyp.GzClpT3,
					3, // Von-Wdh-Vorgabe
					3, // Bis-Wdh-Vorgabe
					100, // Prozent
					0, // SessionID
					0, // UebungID
					i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
				)
			);
		}
		aNeueSession.addUebung(mUebung);

		// T2-Lift
		mUebung = Uebung.StaticKopiere(
			this.pDbModule,
			this.pDbModule.SucheUebungPerName(aT2Uebung),
			UebungsKategorie02.Session
		);
		mUebung.GewichtSteigerung = 1;
		mUebung.GewichtReduzierung = 1;

		// if (this.ProgrammKategorie === SessionKategorie.Konkret) {
		//     this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT2, aNeueSession);
		// }
		// Arbeits-Saetze anfügen
		mAnzSaetze = 3;
		for (let i = 0; i < mAnzSaetze; i++) {
			mUebung.SatzListe.push(
				Satz.NeuerSatz(
					SatzTyp.Training,
					LiftTyp.GzClpT3,
					0, // Von-Wdh-Vorgabe
					10, // Bis-Wdh-Vorgabe
					85, // Prozent
					0, // SessionID
					0, // UebungID
					false // Kein AMRAP
				)
			);
		}
		aNeueSession.addUebung(mUebung);

		// T3-Lift
		mUebung = Uebung.StaticKopiere(
			this.pDbModule,
			this.pDbModule.SucheUebungPerName(aT3Uebung),
			UebungsKategorie02.Session
		);
		mUebung.GewichtSteigerung = 1;
		mUebung.GewichtReduzierung = 1;
		
		// Arbeits-Saetze anfügen
		for (let i = 0; i < 3; i++) {
			mUebung.SatzListe.push(
				Satz.NeuerSatz(
					SatzTyp.Training,
					LiftTyp.GzClpT3,
					0, // Von-Wdh-Vorgabe
					15, // Bis-Wdh-Vorgabe
					65, // Prozent
					0, // SessionID
					0, // UebungID
					i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
				)
			);
		}
		aNeueSession.addUebung(mUebung);
	}

	public static ErzeugeGzclpVorlage(aDbModule: DexieSvcService): ITrainingsProgramm {
		const mGzclpVorlage: ITrainingsProgramm = new GzclpProgramm(ProgrammKategorie.Vorlage, aDbModule);
		mGzclpVorlage.Name = "GZCLP - Standard";
		const mSessions: Array<ISession> = new Array<ISession>();
		mGzclpVorlage.Init(mSessions);
		return mGzclpVorlage;
	}
}
