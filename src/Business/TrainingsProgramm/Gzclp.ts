import { IUebung } from './../Uebung/Uebung';
import { UebungService } from './../../app/services/uebung.service';
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie } from './TrainingsProgramm';
import { ISession, Session } from '../Session/Session';
import { ISatz, Satz, SatzTyp, SatzStatus, SatzPausen, LiftTyp } from '../Satz/Satz';
import { UebungsName } from '../Uebung/Uebung';
import { deserialize } from '@peerlancers/json-serialization';
import { Uebung_Stamm } from '../Uebung/Uebung_Stamm';

export class GzclpProgramm extends TrainingsProgramm {
           constructor(
               private fUebungService: UebungService,
               aProgrammKategorie: ProgrammKategorie
           ) {
               super(aProgrammKategorie);
               this.Tage = 4;
           }

           public NeuerSatz(
               aSatzTyp: SatzTyp,
               aLiftTyp: LiftTyp,
               aWdhVorgabe: number,
               aProzent: number,
               aSession: ISession,
               aUebung: IUebung,
               aAmrap: boolean
           ): ISatz {
               let mNeuSatz = new Satz();
               mNeuSatz.SessionID = aSession.ID;
               mNeuSatz.Status = SatzStatus.Wartet;
               mNeuSatz.SatzTyp = aSatzTyp;
               mNeuSatz.LiftTyp = aLiftTyp;
               mNeuSatz.Uebung = aUebung;
               mNeuSatz.PausenMinZeit = SatzPausen.Standard_Min;
               mNeuSatz.PausenMaxZeit = SatzPausen.Standard_Max;
               mNeuSatz.WdhVorgabe = aWdhVorgabe;
               mNeuSatz.AMRAP = aAmrap;
               mNeuSatz.Prozent = aProzent;
               return mNeuSatz;
           }

           protected PreCopy(): ITrainingsProgramm {
               return new GzclpProgramm(
                   this.fUebungService,
                   this.ProgrammKategorie
               );
           }

           public ErstelleProgrammAusVorlage(): ITrainingsProgramm {
               const mResult = this.Copy();
               mResult.ProgrammKategorie = ProgrammKategorie.Konkret;
               return mResult;
           }

           public DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
               const s = deserialize(GzclpProgramm, aJsonData);
               return s;
           }

           private ErzeugeAufwaermSaetze(
               aUebung: Uebung_Stamm,
               aLiftTyp: LiftTyp,
               aSession: Session
           ) {
               // Aufwärm-Saetze anfügen
               for (let i = 0; i < 3; i++) {
                   switch (i) {
                       case 0:
                           aSession.Saetze.push(
                               this.NeuerSatz(
                                   SatzTyp.Aufwaermen,
                                   aLiftTyp,
                                   4,
                                   40,
                                   aSession,
                                   aUebung,
                                   false
                               )
                           );
                           break;

                       case 1:
                           aSession.Saetze.push(
                               this.NeuerSatz(
                                   SatzTyp.Aufwaermen,
                                   aLiftTyp,
                                   3,
                                   50,
                                   aSession,
                                   aUebung,
                                   false
                               )
                           );
                           break;

                       default:
                           aSession.Saetze.push(
                               this.NeuerSatz(
                                   SatzTyp.Aufwaermen,
                                   aLiftTyp,
                                   2,
                                   60,
                                   aSession,
                                   aUebung,
                                   false
                               )
                           );
                   }
               }
           }

           protected InitTag(aTagNr: number): Array<ISession> {
               const mSessions = new Array<ISession>();
               const mNeueSession = new Session({
                   ID: 0,
                   TagNr: aTagNr,
                   Saetze: [],
                   Datum: null,
                   DauerInSek: 0,
                   FK_Programm: this.ID,
               } as Session);

               mSessions.push(mNeueSession);

               switch (aTagNr) {
                   case 1:
                       this.ErzeugeSessions(
                           UebungsName.Squat,
                           UebungsName.Benchpress,
                           UebungsName.Dips,
                           mNeueSession
                       );
                       break;

                   case 2:
                       this.ErzeugeSessions(
                           UebungsName.OverheadPress,
                           UebungsName.Deadlift,
                           UebungsName.ChinUps,
                           mNeueSession
                       );
                       break;

                   case 3:
                       this.ErzeugeSessions(
                           UebungsName.Benchpress,
                           UebungsName.Squat,
                           UebungsName.Dips,
                           mNeueSession
                       );
                       break;

                   case 4:
                       this.ErzeugeSessions(
                           UebungsName.Deadlift,
                           UebungsName.OverheadPress,
                           UebungsName.ChinUps,
                           mNeueSession
                       );
                       break;
               }
               return mSessions;
           }

           private ErzeugeSessions(
               aT1Uebung: UebungsName,
               aT2Uebung: UebungsName,
               aT3Uebung: UebungsName,
               aNeueSession: Session
           ): void {
               // T1-Lift
               let mUebung = this.fUebungService.Kopiere(
                   this.fUebungService.SucheUebungPerName(aT1Uebung)
               );
               this.ErzeugeAufwaermSaetze(
                   mUebung,
                   LiftTyp.Custom,
                   aNeueSession
               );
               let mArbeitsSatz = null;
               // Arbeits-Saetze anfügen
               for (let i = 0; i < 5; i++) {
                   mArbeitsSatz = new Satz();
                   mArbeitsSatz.Status = SatzStatus.Wartet;
                   mArbeitsSatz.SatzTyp = SatzTyp.Training;
                   mArbeitsSatz.LiftTyp = LiftTyp.GzClpT1;
                   mArbeitsSatz.Uebung = mUebung;
                   mArbeitsSatz.PausenMinZeit = SatzPausen.GzClpT1_Min;
                   mArbeitsSatz.PausenMaxZeit = SatzPausen.GzClpT1_Max;
                   mArbeitsSatz.Prozent = 100;
                   mArbeitsSatz.WdhVorgabe = 3;
                   mArbeitsSatz.AMRAP = false;
                   aNeueSession.Saetze.push(mArbeitsSatz);
               }
               // Der letzte Satz ist AMRAP
               aNeueSession.Saetze[aNeueSession.Saetze.length - 1].AMRAP = true;
               // T2-Lift
               mUebung = this.fUebungService.Kopiere(
                   this.fUebungService.SucheUebungPerName(aT2Uebung)
               );
               if (this.ProgrammKategorie === ProgrammKategorie.Konkret) {
                   this.ErzeugeAufwaermSaetze(
                       mUebung,
                       LiftTyp.GzClpT2,
                       aNeueSession
                   );
               }
               // Arbeits-Saetze anfügen
               for (let i = 0; i < 3; i++) {
                   mArbeitsSatz = new Satz();
                   mArbeitsSatz.Status = SatzStatus.Wartet;
                   mArbeitsSatz.SatzTyp = SatzTyp.Training;
                   mArbeitsSatz.LiftTyp = LiftTyp.GzClpT2;
                   mArbeitsSatz.Uebung = mUebung;
                   mArbeitsSatz.PausenMinZeit = SatzPausen.GzClpT2_Min;
                   mArbeitsSatz.PausenMaxZeit = SatzPausen.GzClpT2_Max;
                   mArbeitsSatz.Prozent = 85;
                   mArbeitsSatz.WdhVorgabe = 10;
                   mArbeitsSatz.AMRAP = false;
                   aNeueSession.Saetze.push(mArbeitsSatz);
               }
               // T3-Lift
               mUebung = this.fUebungService.Kopiere(
                   this.fUebungService.SucheUebungPerName(aT3Uebung)
               );
               // Arbeits-Saetze anfügen
               for (let i = 0; i < 3; i++) {
                   mArbeitsSatz = new Satz();
                   mArbeitsSatz.Status = SatzStatus.Wartet;
                   mArbeitsSatz.SatzTyp = SatzTyp.Training;
                   mArbeitsSatz.LiftTyp = LiftTyp.GzClpT3;
                   mArbeitsSatz.Uebung = mUebung;
                   mArbeitsSatz.PausenMinZeit = SatzPausen.GzClpT3_Min;
                   mArbeitsSatz.PausenMaxZeit = SatzPausen.GzClpT3_Max;
                   mArbeitsSatz.Prozent = 65;
                   mArbeitsSatz.WdhVorgabe = 15;
                   mArbeitsSatz.AMRAP = false;
                   aNeueSession.Saetze.push(mArbeitsSatz);
               }
               // Der letzte Satz ist AMRAP
               aNeueSession.Saetze[aNeueSession.Saetze.length - 1].AMRAP = true;
           }
       }

