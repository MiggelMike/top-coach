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
    ISatz,
    Satz,
    SatzTyp,
    SatzStatus,
    SatzPausen,
    LiftTyp,
} from '../Satz/Satz';

import { deserialize } from '@peerlancers/json-serialization';

export class GzclpProgramm extends TrainingsProgramm {
	constructor(aProgrammKategorie: ProgrammKategorie, public override pDbModule: DexieSvcService) {
		super(ProgrammTyp.Gzclp, aProgrammKategorie, pDbModule);
		this.Tage = 4;
	}

	public PreCopy(): ITrainingsProgramm {
		return new GzclpProgramm(this.ProgrammKategorie, this.pDbModule);
	}

	public override DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
		const s = deserialize(GzclpProgramm, aJsonData);
		return s;
	}

	private ErzeugeAufwaermSaetze(aUebung: Uebung, aLiftTyp: LiftTyp, aUebung_Sess: Uebung) {
		// Aufwärm-Saetze anfügen
		// for (let i = 0; i < 3; i++) {
		//     switch (i) {
		//         case 0:
		//             aUebung_Sess.Saetze.push(
		//                 this.NeuerSatz(
		//                     SatzTyp.Aufwaermen,
		//                     aLiftTyp,
		//                     4,
		//                     40,
		//                     aUebung_Sess,
		//                     aUebung,
		//                     false
		//                 )
		//             );
		//             break;
		//         case 1:
		//             aUebung_Sess.Saetze.push(
		//                 this.NeuerSatz(
		//                     SatzTyp.Aufwaermen,
		//                     aLiftTyp,
		//                     3,
		//                     50,
		//                     aUebung_Sess,
		//                     aUebung,
		//                     false
		//                 )
		//             );
		//             break;
		//         default:
		//             aUebung_Sess.Saetze.push(
		//                 this.NeuerSatz(
		//                     SatzTyp.Aufwaermen,
		//                     aLiftTyp,
		//                     2,
		//                     60,
		//                     aUebung_Sess,
		//                     aUebung,
		//                     false
		//                 )
		//             );
		//     }
		// }
	}

	protected override InitTag(aSessionNr: number): Array<ISession> {
		const mSessions = new Array<ISession>();
		const mNeueSession = new Session();
		mNeueSession.Name = `Day #${aSessionNr}  --- `;
		// `0${month}
		switch (aSessionNr - (1 % 4)) {
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

		mSessions.push(mNeueSession);

		switch (aSessionNr) {
			case 1:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.Squat).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Benchpress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Dips).Name,
					mNeueSession
				);
				break;

			case 2:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.OverheadPress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Deadlift).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.ChinUps).Name,
					mNeueSession
				);
				break;

			case 3:
				this.ErzeugeSessions(
					StandardUebung.getStandardUebung(StandardUebungsName.Benchpress).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Squat).Name,
					StandardUebung.getStandardUebung(StandardUebungsName.Dips).Name,
					mNeueSession
				);
				break;

			case 4:
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
		let mUebung: Uebung = Uebung.StaticKopiere(this.pDbModule.SucheUebungPerName(aT1Uebung), UebungsKategorie02.Session);
		// this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.Custom, aNeueSession);

		// Arbeits-Saetze anfügen
		let mAnzSaetze = 5;
		for (let i = 0; i < mAnzSaetze; i++) {
			mUebung.SatzListe.push(
				Satz.NeuerSatz(
					SatzTyp.Training,
					LiftTyp.GzClpT3,
					0, // Von-Wdh-Vorgabe
					3, // Bis-Wdh-Vorgabe
					100, // Prozent
					0, // SessionID
					0, // UebungID
					i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
				)
			);
		}
		aNeueSession.UebungsListe.push(mUebung);

		// T2-Lift
		mUebung = Uebung.StaticKopiere(this.pDbModule.SucheUebungPerName(aT2Uebung), UebungsKategorie02.Session);

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
		aNeueSession.UebungsListe.push(mUebung);

		// T3-Lift
		mUebung = Uebung.StaticKopiere(this.pDbModule.SucheUebungPerName(aT3Uebung), UebungsKategorie02.Session);

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
		aNeueSession.UebungsListe.push(mUebung);
	}

	public static ErzeugeGzclpVorlage(aDbModule: DexieSvcService): ITrainingsProgramm {
		const mGzclpVorlage: ITrainingsProgramm = new GzclpProgramm(ProgrammKategorie.Vorlage, aDbModule);
		mGzclpVorlage.Name = "GZCLP - Standard";
		const mSessions: Array<ISession> = new Array<ISession>();
		mGzclpVorlage.Init(mSessions);
		return mGzclpVorlage;
	}
}
