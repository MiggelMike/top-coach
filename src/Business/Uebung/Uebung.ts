import { EquipmentTyp } from 'src/Business/Equipment/Equipment';
import { EquipmentOrigin } from './../Equipment/Equipment';
import { AppData, GewichtsEinheit } from 'src/Business/Coach/Coach';
import { cWeightDigits, cMinDatum } from './../../app/services/dexie-svc.service';
import { ProgressGroup, WeightProgress } from 'src/Business/Progress/Progress';
import { Zeitraum } from './../Dauer';
import { MuscleGroupKategorie02 } from '../MuscleGroup/MuscleGroup';
import { VorgabeWeightLimit } from '../Progress/Progress';
import { Satz, SatzTyp, LiftTyp, SatzPausen, SatzStatus } from './../Satz/Satz';
import { isJSDocThisTag } from 'typescript';

var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual')

export enum UebungsTyp {
  Undefined = 'Undefined',
  Custom = 'Custom',
  Kraft = 'Kraft',
  Ausdauer = 'Ausdauer',
  Dehnung = 'Dehnung',
}


export enum UebungsKategorie01 {
  Keine = 'Keine',
  GzclpT1Cycle0 = 'GzclpT1Cycle0',
  GzclpT1Cycle1 = 'GzclpT1Cycle1',
  GzclpT1Cycle2 = 'GzclpT1Cycle2',
  GzclpT2Cycle0 = 'GzclpT2Cycle0',
  GzclpT2Cycle1 = 'GzclpT2Cycle1',
  GzclpT2Cycle2 = 'GzclpT2Cycle2',
}

export enum UebungsKategorie02 {
  Stamm,
  Session,
}

export enum SaetzeStatus {
    KeinerVorhanden,
    NichtAlleFertig,
    AlleFertig
  }
  
export enum WdhVorgabeStatus {
    NichtGeschafft,
    Geschafft
}


export class InUpcomingSessionSetzen {
    Progress: boolean = false;
    ProgressGroup: boolean = false;
    WarmUpVisible: boolean = false;
    CooldownVisible: boolean = false;
    IncludeWarmupWeight: boolean = false;
    IncludeCoolDownWeight: boolean = false;
    MaxFailCount: boolean = false;
    GewichtSteigerung: boolean = false;
    GewichtReduzierung: boolean = false;
    AufwaermArbeitsSatzPause: boolean = false;
    ArbeitsSatzPause1: boolean = false;
    ArbeitsSatzPause2: boolean = false;
    NaechsteUebungPause: boolean = false;
    public init() {
        this.Progress = false;
        this.ProgressGroup = false;
        this.WarmUpVisible = false;
        this.CooldownVisible = false;
        this.IncludeWarmupWeight = false;
        this.IncludeCoolDownWeight = false;
        this.MaxFailCount = false;
        this.GewichtSteigerung = false;
        this.GewichtReduzierung = false;
        this.AufwaermArbeitsSatzPause = false;
        this.ArbeitsSatzPause1 = false;
        this.ArbeitsSatzPause2 = false;
        this.NaechsteUebungPause = false;
    }
}

export interface IUebungDB {
    ID: number;
    // Bei Session-Uebungen ist FkUebung der Schluessel zur Stamm-Uebung
    FkUebung: number;
    // Schluessel zur Muskel-Gruppe
    FkMuskel01: number;
    FkMuskel02: number;
    FkMuskel03: number;
    FkMuskel04: number;
    FkMuskel05: number;
    FkHantel: number;
    MuskelGruppe: string;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
    Kategorie02: UebungsKategorie02;
    SessionID: number;
    Selected: boolean;
    WarmUpVisible: boolean;
    CooldownVisible: boolean;
    IncludeWarmupWeight: boolean;
    IncludeCoolDownWeight: boolean;
    LiftedWeightVisible: boolean;
    LiftedWeight: number;
    Expanded: boolean;
    InfoLink: string;
    Beschreibung: string;
    FkProgress: number;
    FkAltProgress: number
    FkOrgProgress: number
    GewichtSteigerung: number;
    GewichtReduzierung: number;
    EquipmentTyp: string;
    MaxFailCount: number;
    FailCount: number;
    FailDatum: Date;
    ArbeitsSaetzeStatus: SaetzeStatus;
    Vorlage: boolean;
    ListenIndex: number;
    AufwaermArbeitsSatzPause: number;
    ArbeitsSatzPause1: number;
    ArbeitsSatzPause2: number;
    ProgressGroup: string;
    AltProgressGroup: string;
    WeightProgress: WeightProgress;
    AltWeightProgress: WeightProgress;
    Datum: Date;
    WeightInitDate: Date;
    FK_Programm: number;
    InUpcomingSessionSetzen: InUpcomingSessionSetzen;
    GewichtsEinheit: GewichtsEinheit;
    NaechsteUebungPause: number;
}

export class UebungDB implements IUebungDB {
    public ID: number;
    public LiftedWeight: number = 0;
    public GewichtSteigerung: number = 0;
    public GewichtReduzierung: number = 0;
    public ArbeitsSaetzeStatus: SaetzeStatus = SaetzeStatus.KeinerVorhanden;;
    public NaechsteUebungPause: number = 0;
    // Bei Session-Uebungen ist FkUebung der Schluessel zur Stamm-Uebung
    //#region FK_Programm
    // private fFK_Programm: number = 0;
    public FK_Programm: number = 0;
    // get FK_Programm(): number {
    //     return Number(this.fFK_Programm);
    // }
    // set FK_Programm(aValue: number) {
    //     this.fFK_Programm = Number(aValue);
    // }
    //#endregion

    public FkUebung: number = 0;
    public FkHantel: number = 0;
    public ListenIndex: number = 0;
    public EquipmentTyp: string = '';
    public Name: string = '';
    public Typ: UebungsTyp = UebungsTyp.Undefined;
    public MaxFailCount: number = 3;
    public FailCount: number = 0;
    public FailDatum: Date = cMinDatum;
    public Kategorieen01: Array<UebungsKategorie01> = [];
    public Kategorie02: UebungsKategorie02 = UebungsKategorie02.Stamm;
    public SessionID: number = 0;
    public Selected: boolean = false;
    public WarmUpVisible: boolean = true;
    public CooldownVisible: boolean = true;
    public LiftedWeightVisible: boolean = true;
    public IncludeWarmupWeight: boolean = false;
    public IncludeCoolDownWeight: boolean = false;
    public BodyWeight: number = 0;
    public Expanded: boolean = false;
    public InfoLink: string = '';
    public Beschreibung: string = '';
    public FkMuskel01: number = 0;
    public FkMuskel02: number = 0;
    public FkMuskel03: number = 0;
    public FkMuskel04: number = 0;
    public FkMuskel05: number = 0;
    public MuskelGruppe: string = '';
    public ArbeitsSatzPause1: number = 0;
    public ArbeitsSatzPause2: number = 0;
    public AufwaermArbeitsSatzPause: number = 0;
    
    public Datum: Date;
    public WeightInitDate: Date = cMinDatum;

    public Vorlage: boolean = false;
    public FkProgress: number = -1;
    public FkAltProgress: number = -1;
    public FkOrgProgress: number = -1;
    public WeightProgress: WeightProgress = WeightProgress.Same;
    public AltWeightProgress: WeightProgress = WeightProgress.Same;
    public ProgressGroup: string = ProgressGroup[0];
    public AltProgressGroup: string = ProgressGroup[0];
    public InUpcomingSessionSetzen: InUpcomingSessionSetzen = new InUpcomingSessionSetzen();
    public GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;
}
    
  
// export interface IUebung extends IUebungDB {
//     Copy(): Uebung;
//     hasChanged(aCmpUebung: IUebung): Boolean;
//     PauseTime1(aSatz:Satz): string;
//     PauseTime2(aSatz: Satz): string;
//     getPauseText(aSatzTyp: string): string;
//     getFirstWaitingWorkSet(aFromIndex: number): Satz;
//     nummeriereSatzListe(aSatzListe: Array<Satz>);
//     isLetzterSatzInUebung(aSatz: Satz): boolean;
//     NaechsteUebungPause:number;
// }

export enum StandardUebungsName {
    Squat = 'Squat',
    Deadlift = 'Deadlift',
    Benchpress = 'Benchpress',
    OverheadPress = 'Overhead-Press',
    AB_Rollout = 'AB-Rollout',
    AB_Wheel = 'AB-Wheel',
    BackExtension = 'Back-Extension',
    BarbellRow = 'Barbell-Row',
    BentOverDumbbellRaise = 'Bent-Over-Dumbbell-Raise',
    BlastStrapPushUp = 'Blast-Strap-Push-Up',
    CableKickBacks = 'Cable-Kick-Backs',
    CablePushDown = 'Cable-Push-Down',
    CableRow = 'Cable-Row',
    CalfRaises = 'Calf-Raises',
    ChestSupportedRows = 'Chest-Supported-Rows',
    ChinUps = 'Chin-Ups',
    PullUps = 'Pull-Ups',
    LatPullDowns = 'Lat-Pull-Downs',
    StandingLegCurls = 'Standing-Leg-Curls',
    NeckExtensions = 'Neck-Extensions',
    NeckCurls = 'Neck-Curls',
    TricepsPushDown = 'Triceps-Push-Down',
    Dips = 'Dips',

}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Uebung  {
    public UebungDB: UebungDB = new UebungDB();
    public StammUebung: Uebung;
    public SatzListe: Array<Satz> = [];
    //#region ID
    get ID(): number {
        return this.UebungDB.ID;
    }

    set ID (aValue: number) {
        this.UebungDB.ID = aValue;
    }
    //#endregion
    //#region FK_Programm
    // Bei Session-Uebungen ist FkUebung der Schluessel zur Stamm-Uebung
    get FK_Programm(): number {
        return this.UebungDB.FK_Programm;
    }

    set FK_Programm( aValue: number) {
        this.UebungDB.FK_Programm = aValue;
    }
    //#endregion 
    //#region FkUebung
    get FkUebung(): number {
        return this.UebungDB.FkUebung;
    }

    set FkUebung( aValue: number) {
        this.UebungDB.FkUebung = aValue;
    }
    //#endregion
    //#region FkHantel
    get FkHantel(): number {
        return this.UebungDB.FkHantel;
    }

    set FkHantel( aValue : number) {
        this.UebungDB.FkHantel = aValue;
    }
    //#endregion
    //#region ListenIndex 
    get ListenIndex(): number {
        return this.UebungDB.ListenIndex;
    }

    set ListenIndex( aValue: number) {
        this.UebungDB.ListenIndex = aValue;
    }
    //#endregion
    //#region EquipmentTyp
    get EquipmentTyp(): string {
        return this.UebungDB.EquipmentTyp;
    };

    set EquipmentTyp(aValue: string) {
        this.UebungDB.EquipmentTyp = aValue;
    };
    //#endregion
    //#region Name
    get Name(): string {
        return this.UebungDB.Name;
    };

    set Name(aValue: string) {
        this.UebungDB.Name = aValue;
    };
    //#endregion
    //#region Typ
    get Typ(): UebungsTyp {
        return this.UebungDB.Typ;
    };

    set Typ(aValue: UebungsTyp) {
        this.UebungDB.Typ = aValue;
    };
    //#endregion    
    //#region MaxFailCount
    get MaxFailCount(): number{
        return this.UebungDB.MaxFailCount
    }
    set MaxFailCount(aValue: number){
        this.UebungDB.MaxFailCount = aValue;
    }
    //#endregion
    //#region FailCount
    get FailCount():number {
        return this.UebungDB.FailCount;
    }

    set FailCount( aValue:number ) {
        this.UebungDB.FailCount = aValue
    }
    //#endregion
    //#region FailDatum
    get FailDatum(): Date {
        return this.UebungDB.FailDatum;
    }

    set FailDatum( aValue: Date) {
         this.UebungDB.FailDatum = aValue;
    }
    //#endregion
    //#region NaechsteUebungPause
    set NaechsteUebungPause(aValue: number) {
        this.UebungDB.NaechsteUebungPause = Number(aValue);
    }
    public get NaechsteUebungPause(): number {
        return Number(this.UebungDB.NaechsteUebungPause);
    }
    //#endregion    
    //#region Kategorieen01
    get Kategorieen01(): Array<UebungsKategorie01> {
        return this.UebungDB.Kategorieen01;
    }
    set Kategorieen01(aValue: Array<UebungsKategorie01>) {
        this.UebungDB.Kategorieen01 = cloneDeep(aValue);
    }
    //#endregion
    //#region Kategorie02
    get Kategorie02(): UebungsKategorie02{
        return this.UebungDB.Kategorie02;
    }
    set Kategorie02(aValue: UebungsKategorie02) {
        this.UebungDB.Kategorie02 = aValue;
    }
    //#endregion
    //#region SessionID
    get SessionID(): number {
        return this.UebungDB.SessionID;
    }
    set SessionID(aValue: number) {
        this.UebungDB.SessionID = aValue;
    }
    //#endregion
    //#region AufwaermSatzListe
    get AufwaermSatzListe(): Array<Satz> {
        const mResult = [];
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }
    //#endregion
    //#region ArbeitsSatzListe
    public get ArbeitsSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp === SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }
    //#endregion
    //#region AbwaermSatzListe
    public get AbwaermSatzListe(): Array<Satz> {
        const mResult = [];
        if (!this.SatzListe) return mResult;

        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Abkuehlen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }
    //#endregion
    //#region Selected
    get Selected(): boolean{
        return this.UebungDB.Selected;
    }
    set Selected(aValue: boolean) {
        this.UebungDB.Selected = aValue;
    }
    //#endregion
    //#region WarmUpVisible
    get WarmUpVisible(): boolean{
        return this.UebungDB.WarmUpVisible;
    }
    set WarmUpVisible( aValue: boolean){
        this.UebungDB.WarmUpVisible = aValue;
    }
    //#endregion
    //#region CooldownVisible
    get CooldownVisible(): boolean {
        return this.UebungDB.CooldownVisible;
    }
    set CooldownVisible( aValue: boolean) {
         this.UebungDB.CooldownVisible = aValue;
    }
    //#endregion
    //#region LiftedWeightVisible
    get LiftedWeightVisible(): boolean{
        return this.UebungDB.LiftedWeightVisible;
    }
    set LiftedWeightVisible(aValue: boolean) {
        this.UebungDB.LiftedWeightVisible = aValue;
    }
    //#endregion
    //#region IncludeWarmupWeight
    get IncludeWarmupWeight(): boolean{
        return this.UebungDB.IncludeWarmupWeight;
    }
    set IncludeWarmupWeight( aValue: boolean){
         this.UebungDB.IncludeWarmupWeight = aValue;
    }
    //#endregion
    //#region IncludeCoolDownWeight
    get IncludeCoolDownWeight(): boolean {
        return this.UebungDB.IncludeCoolDownWeight;
    }
    set IncludeCoolDownWeight( aVelue: boolean) {
         this.UebungDB.IncludeCoolDownWeight = aVelue;
    }
    //#endregion
    //#region BodyWeight
    get BodyWeight(): number {
        return this.UebungDB.BodyWeight;
    }
    set BodyWeight( aValue: number) {
        this.UebungDB.BodyWeight = aValue;
    }
    //#endregion
    //#region Expanded 
    get Expanded(): boolean{
        return this.UebungDB.Expanded;
    }
    set Expanded(aValue: boolean) {
        this.UebungDB.Expanded = aValue;
    }
    //#endregion
    //#region InfoLink 
    get InfoLink(): string{
        return this.UebungDB.InfoLink;
    }
    set InfoLink(aValue: string) {
        this.UebungDB.InfoLink = aValue;
    }
    //#endregion
    //#region Beschreibung
    get Beschreibung(): string{
        return this.UebungDB.Beschreibung;
    }
    set Beschreibung( aValue: string){
        this.UebungDB.Beschreibung = aValue;
    }
    //#endregion
    //#region FkMuskel01
    get FkMuskel01(): number{
        return this.UebungDB.FkMuskel01;
    }
    set FkMuskel01(aValue: number){
        this.UebungDB.FkMuskel01 = aValue;
    }
    //#endregion
    //#region FkMuskel02
    get FkMuskel02(): number{
        return this.UebungDB.FkMuskel02;
    }
    set FkMuskel02(aValue: number){
        this.UebungDB.FkMuskel02 = aValue;
    }
    //#endregion
    //#region FkMuskel03
    get FkMuskel03(): number{
        return this.UebungDB.FkMuskel03;
    }
    set FkMuskel03(aValue: number){
        this.UebungDB.FkMuskel03 = aValue;
    }
    //#endregion
    //#region FkMuskel04
    get FkMuskel04(): number{
        return this.UebungDB.FkMuskel04;
    }
    set FkMuskel04(aValue: number){
        this.UebungDB.FkMuskel04 = aValue;
    }
    //#endregion
    //#region FkMuskel05
    get FkMuskel05(): number{
        return this.UebungDB.FkMuskel05;
    }
    set FkMuskel05(aValue: number){
        this.UebungDB.FkMuskel05 = aValue;
    }
    //#endregion
    //#region MuskelGruppe
    get MuskelGruppe(): string{
        return this.UebungDB.MuskelGruppe;
    }
    set MuskelGruppe(aValue: string) {
        this.UebungDB.MuskelGruppe = aValue;
    }
    //#endregion
    //#region ArbeitsSatzPause1
    get ArbeitsSatzPause1(): number{
        return Number(this.UebungDB.ArbeitsSatzPause1);
    }
    set ArbeitsSatzPause1(aValue: number) {
        this.UebungDB.ArbeitsSatzPause1 = Number(aValue);
    }
    //#endregion
    //#region ArbeitsSatzPause2
    get ArbeitsSatzPause2(): number{
        return this.UebungDB.ArbeitsSatzPause2;
    }
    set ArbeitsSatzPause2(aValue: number) {
        this.UebungDB.ArbeitsSatzPause2 = aValue;
    }
    //#endregion
    //#region AufwaermArbeitsSatzPause
    get AufwaermArbeitsSatzPause(): number {
        return Number(this.UebungDB.AufwaermArbeitsSatzPause);
    }
    set AufwaermArbeitsSatzPause(aValue: number) {
        this.UebungDB.AufwaermArbeitsSatzPause = Number(aValue);
    }
    //#endregion
    //#region Datum
    get Datum(): Date {
        return this.UebungDB.Datum;
    }
    set Datum( aValue: Date) {
        this.UebungDB.Datum = aValue;
    }
    //#endregion
    //#region WeightInitDate
    get WeightInitDate(): Date{
        return this.UebungDB.WeightInitDate;
    }
    set WeightInitDate( aValue: Date){
        this.UebungDB.WeightInitDate = aValue;
    }
    //#endregion
    //#region Vorlage
    get Vorlage(): boolean{
        return this.UebungDB.Vorlage;
    }
    set Vorlage( aValue: boolean){
        this.UebungDB.Vorlage = aValue;
    }
    //#endregion
    //#region FkProgress
    get FkProgress(): number{
        return this.UebungDB.FkProgress;
    }
    set FkProgress( aValue: number){
        this.UebungDB.FkProgress = aValue;
    }
    //#endregion
    //#region FkAltProgress
    get FkAltProgress(): number{
        return this.UebungDB.FkAltProgress;
    }
    set FkAltProgress( aValue: number){
        this.UebungDB.FkAltProgress = aValue;
    }
    //#endregion
    //#region FkOrgProgress
    get FkOrgProgress(): number{
        return this.UebungDB.FkOrgProgress;
    }
    set FkOrgProgress(aValue: number) {
        this.UebungDB.FkOrgProgress = aValue;
    }
    //#endregion
    //#region WeightProgress
    get WeightProgress(): WeightProgress {
        return this.UebungDB.WeightProgress;
    }
    set WeightProgress(aValue: WeightProgress) {
        this.UebungDB.WeightProgress = aValue;
    }
    //#endregion
    //#region AltWeightProgress
    get AltWeightProgress(): WeightProgress {
        return this.UebungDB.AltWeightProgress;
    }
    set AltWeightProgress( aValue: WeightProgress) {
        this.UebungDB.AltWeightProgress = aValue;
    }
    //#endregion
    //#region ProgressGroup
    get ProgressGroup(): string{
        return this.UebungDB.ProgressGroup;
    }
    set ProgressGroup(aValue: string) {
        this.UebungDB.ProgressGroup = aValue;
    }
    //#endregion
    //#region AltProgressGroup
    get AltProgressGroup(): string{
        return this.UebungDB.AltProgressGroup;
    }
    set AltProgressGroup(aValue: string) {
        this.UebungDB.AltProgressGroup = aValue;
    }
    //#endregion
    //#region InUpcomingSessionSetzen
    get InUpcomingSessionSetzen(): InUpcomingSessionSetzen{
        return this.UebungDB.InUpcomingSessionSetzen;
    }
    set InUpcomingSessionSetzen(aValue: InUpcomingSessionSetzen) {
        this.UebungDB.InUpcomingSessionSetzen = aValue;
    }
    //#endregion
    //#region GewichtsEinheit
    get GewichtsEinheit(): GewichtsEinheit{
        return this.UebungDB.GewichtsEinheit;
    }
    set GewichtsEinheit( aValue: GewichtsEinheit){
        this.UebungDB.GewichtsEinheit = aValue;
    }
    //#endregion
    //#region GewichtSteigerung
    set GewichtSteigerung(aValue: number) {
        this.UebungDB.GewichtSteigerung = AppData.StaticRoundTo(aValue,cWeightDigits);
    }

    get GewichtSteigerung(): number {
        return AppData.StaticRoundTo(this.UebungDB.GewichtSteigerung,cWeightDigits);
    }
    //#endregion
    //#region GewichtReduzierung  
    set GewichtReduzierung(aValue: number) {
        this.UebungDB.GewichtReduzierung = Number(aValue);
    }

    get GewichtReduzierung(): number {
        return Number(this.UebungDB.GewichtReduzierung);
    }
    //#endregion
    //#region ArbeitsSaetzeStatus
    get ArbeitsSaetzeStatus(): SaetzeStatus{
        return this.UebungDB.ArbeitsSaetzeStatus;
    }
    set ArbeitsSaetzeStatus( aValue: SaetzeStatus){
        this.UebungDB.ArbeitsSaetzeStatus = aValue;
    }
    //#endregion

    public static StaticCheckMembers(aUebung: Uebung) {
        if (aUebung.GewichtsEinheit === undefined)
            aUebung.GewichtsEinheit = GewichtsEinheit.KG;

        // if (aUebung.getArbeitsSaetzeStatus === undefined)
        //     aUebung.getArbeitsSaetzeStatus = Uebung.getArbeitsSaetzeStatus;
        
    };

    public PruefeGewichtsEinheit(aGewichtsEinheit: GewichtsEinheit) {
        // Uebung.StaticCheckMembers(this);
        if (aGewichtsEinheit !== this.GewichtsEinheit) {
            this.GewichtReduzierung = AppData.StaticConvertWeight(this.GewichtReduzierung, aGewichtsEinheit);
            this.GewichtSteigerung = AppData.StaticConvertWeight(this.GewichtSteigerung, aGewichtsEinheit);
            this.GewichtsEinheit = aGewichtsEinheit;
        }
    }


    public getFirstWaitingWorkSet(aFromIndex: number = 0): Satz {
        for (let index = aFromIndex; index < this.ArbeitsSatzListe.length; index++) {
            const mPtrSatz: Satz = this.ArbeitsSatzListe[index];
            if (mPtrSatz.Status === SatzStatus.Wartet)
                return mPtrSatz;
        }
        return undefined
    }

    public nummeriereSatzListe(aSatzListe: Array<Satz>): void{
        for (let index = 0; index < aSatzListe.length; index++) {
            aSatzListe[index].SatzListIndex = index;
        }
    }

    public static StaticUebungsListeSortByListenIndex(aUebungsListe: Array<Uebung>): Array<Uebung>{
        return aUebungsListe.sort(
            (u1,u2) => 
            {
                if (u1.ListenIndex > u2.ListenIndex)
                    return 1;
                
                if (u1.ListenIndex < u2.ListenIndex)
                    return -1;
                
                return 0;
            });
    }

    public PauseTime1(aSatz:Satz): string{
        return '00:00:00';
    }

    public PauseTime2(aSatz:Satz): string{
        return '00:00:00';
    }    

    public static StaticGetArbeitsSatzStatus(aUebung: Uebung, aSatzIndex: number): SatzStatus {
        if ((aUebung.ArbeitsSatzListe.length <= 0) || (aSatzIndex >= aUebung.ArbeitsSatzListe.length) || (aSatzIndex < 0))
            return undefined;
        
        return aUebung.ArbeitsSatzListe[aSatzIndex].Status;
    }

    public getFindUndDoneSetAfter(aVonSatz: Satz): Satz {
        for (let index = aVonSatz.SatzListIndex + 1; index < this.SatzListe.length; index++) {
            const mPtrSatz: Satz = this.SatzListe[index];
            if (mPtrSatz.Status === SatzStatus.Wartet)
                return mPtrSatz;
                
        }
        return undefined;
    }

    public static StaticAlleSaetzeStatus(aUebung: Uebung): SaetzeStatus {
        if (aUebung.SatzListe.length <= 0) {
            return SaetzeStatus.KeinerVorhanden;
        } else {
            let mAnzFertig: number = 0;
            aUebung.SatzListe.forEach((s) => {
                if (s.Status === SatzStatus.Fertig)
                    mAnzFertig++;
            });

            if (mAnzFertig >= aUebung.SatzListe.length) {
                return SaetzeStatus.AlleFertig;;
            }
        }

        aUebung.ArbeitsSaetzeStatus = SaetzeStatus.NichtAlleFertig;
        return SaetzeStatus.NichtAlleFertig;
        
    }

    public static StaticArbeitsSaetzeStatus(aUebung: Uebung): SaetzeStatus
    {
        if (aUebung.ArbeitsSatzListe.length <= 0) {
            aUebung.ArbeitsSaetzeStatus = SaetzeStatus.KeinerVorhanden;
            return SaetzeStatus.KeinerVorhanden;
        } else {
            let mAnzFertig: number = 0;
            aUebung.ArbeitsSatzListe.forEach((s) => {
                if (s.Status === SatzStatus.Fertig)
                    mAnzFertig++;
            });

            if (mAnzFertig >= aUebung.ArbeitsSatzListe.length) {
                aUebung.ArbeitsSaetzeStatus = SaetzeStatus.AlleFertig;
                return SaetzeStatus.AlleFertig;;
            }
        }

        aUebung.ArbeitsSaetzeStatus = SaetzeStatus.NichtAlleFertig;
        return SaetzeStatus.NichtAlleFertig;
    }


    public getPauseText(aSatzTyp: string): string {
        return Zeitraum.FormatDauer(0);
        // return '00:00:00';
    }

    public setPauseText(aSatzTyp: SatzTyp, aValue: string) {
        
        // return '00:00:00';
    }

    public isLetzterSatzInUebung(aSatz: Satz): boolean {
		return (aSatz.SatzListIndex >= this.SatzListe.length - 1);
	}



    public hasChanged(aCmpUebung: Uebung): Boolean {
        if (this.ID != aCmpUebung.ID) return true;
        if (this.Kategorie02 != aCmpUebung.Kategorie02) return true;
        if (this.Name != aCmpUebung.Name) return true;
        if (this.Typ != aCmpUebung.Typ) return true;

        if (this.Kategorieen01.length != aCmpUebung.Kategorieen01.length)
            return true;
        for (let index = 0; index < this.Kategorieen01.length; index++) {
            if (this.Kategorieen01[index] != aCmpUebung.Kategorieen01[index])
                return true;
        }

        if (this.SatzListe && aCmpUebung.SatzListe) {
            if (this.SatzListe.length != aCmpUebung.SatzListe.length) return true;

            for (let index = 0; index < this.SatzListe.length; index++) {
                if (this.SatzListe[index].isEqual(aCmpUebung.SatzListe[index])) {
                    console.log('Set #' + index.toString() + ' has changed.');
                    return true;
                }
            }
        }

        return false;
    }

    public SummeWDH(): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length === 0))
            return -1;
        
        let mResult = 0;
        this.ArbeitsSatzListe.forEach(satz => {
            if(satz.Status === SatzStatus.Fertig)
                mResult += Number(satz.WdhAusgefuehrt);
            
        });
        return mResult;
    }

    public SummeVorgabeWDH(aVorgabeWeightFrom: VorgabeWeightLimit): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length === 0))
            return -1;
        
        let mResult = 0;
        this.ArbeitsSatzListe.forEach(satz => {
            if (aVorgabeWeightFrom === VorgabeWeightLimit.LowerLimit)
                mResult += Number(satz.WdhVonVorgabe);
            else
                mResult += Number(satz.WdhBisVorgabe);
        });

        return mResult;
    }

    public SatzFertig(aSatzIndex: number): boolean {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return false;
        
        return this.ArbeitsSatzListe[aSatzIndex].Status === SatzStatus.Fertig;
    }    


    public SatzWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhAusgefuehrt;
    }

    public SetzeArbeitsSaetzeGewichtNaechsteSession(aGewicht: number): void {
        if (this.ArbeitsSatzListe !== undefined)
            this.ArbeitsSatzListe.forEach((sz) => sz.GewichtNaechsteSession = aGewicht);
    }

    public SatzVonVorgabeWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhVonVorgabe;
    }

    public SatzBisVorgabeWDH(aSatzIndex: number): number {
        if ((this.ArbeitsSatzListe === undefined)||(this.ArbeitsSatzListe.length < aSatzIndex))
            return -1;
        
        return this.ArbeitsSatzListe[aSatzIndex].WdhBisVorgabe;
    }

    public Copy(aFailDatum: Date = cMinDatum): Uebung {
        const mTmpSatzListe: Array<Satz> = [];
        if(this.SatzListe !== undefined)
            this.SatzListe.forEach((sz) => mTmpSatzListe.push(sz.Copy()));
        const mUebung: Uebung = cloneDeep(this);
        mUebung.SatzListe = mTmpSatzListe;
        mUebung.FailDatum = aFailDatum;
        return mUebung;

    }

    public get LiftedWeight(): number {
        let mResult: number = 0;

        this.AufwaermSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        this.AbwaermSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        this.ArbeitsSatzListe.forEach(
            (satz) => (mResult = mResult + satz.LiftedWeight)
        );

        return mResult;
    }

    private checkSatzIncludedBodyWeight(aSatzListe: Array<Satz>): Boolean {
        for (let index = 0; index < aSatzListe.length; index++) {
            const mSatz = aSatzListe[index];
            if (mSatz.IncludeBodyweight) return true;
        }
        return false;
    }

    public checkWarmUpSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.AufwaermSatzListe);
    }

    public checkCoolDownSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.AbwaermSatzListe);
    }

    public checkArbeitsSatzIncludedBodyWeight(): Boolean {
        return this.checkSatzIncludedBodyWeight(this.ArbeitsSatzListe);
    }

    public static ErzeugeGzclpKategorieen01(): Array<UebungsKategorie01> {
        return new Array<UebungsKategorie01>(
            UebungsKategorie01.GzclpT1Cycle0,
            UebungsKategorie01.GzclpT1Cycle1,
            UebungsKategorie01.GzclpT1Cycle2,
            UebungsKategorie01.GzclpT2Cycle0,
            UebungsKategorie01.GzclpT2Cycle1,
            UebungsKategorie01.GzclpT2Cycle2
        );
    }

    public isEqual(aOtherExercise: Uebung): Boolean {
        return isEqual(this,aOtherExercise);
    }

    public static StaticNeueUebung(
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>,
        aKategorie02: UebungsKategorie02,
        aFkProgess: number
    ): Uebung {
        //
        const mUebung = new Uebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        mUebung.Kategorie02 = aKategorie02;
        mUebung.FkProgress = aFkProgess;
        mUebung.FkAltProgress = aFkProgess;
        return mUebung;
    }

    

    public NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aVonWdhVorgabe: number,
        aBisWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): Satz {
        const mSatz = new Satz({
            UebungID: this.ID,
            SatzTyp: aSatzTyp,
            Prozent: aProzent,
            WdhVonVorgabe: aVonWdhVorgabe,
            WdhBisVorgabe: aBisWdhVorgabe,
            WdhAusgefuehrt: 0,
            GewichtAusgefuehrt: 0,
            PausenMinZeit: SatzPausen.Standard_Min,
            PausenMaxZeit: SatzPausen.Standard_Max,
            Status: SatzStatus.Wartet,
            AMRAP: aAmrap,
        } as Satz);
        mSatz.LiftTyp = aLiftTyp;
        return mSatz;
    }

    public static StaticKopiere(
        aUebung: Uebung,
        aKategorie02: UebungsKategorie02
    ): Uebung {
        const mUebung = Uebung.StaticNeueUebung(
            aUebung.Name,
            aUebung.Typ,
            aUebung.Kategorieen01,
            aKategorie02,
            aUebung.FkProgress
        );

        // Soll eine Session-Übung erzeugt werden? 
        if (aKategorie02 === UebungsKategorie02.Session) {
            // Es soll eine Session-Übung erzeugt werden. 
            // Deshalb muss der Fremd-Schlüssel zur Stamm-Übung gesetzt werden.

            // Ist die zu kopierende Übung (aUebung) eine Stamm-Übung?
            if (aUebung.Kategorie02 === UebungsKategorie02.Stamm)
                // Die zu kopierende Übung (aUebung) ist eine Stamm-Übung
                // Dann muss ihre ID in die neue Session-Übung gesetzt werden
                mUebung.FkUebung = aUebung.ID;
            else
                // Die zu kopierende Übung (aUebung) ist keine Stamm-Übung.
                // Dann muss ihr Fremd-Schlüssel zur Stamm-Übung gesetzt sein  
                // und in die neue Session-Übung gesetzt werden
                mUebung.FkUebung = aUebung.FkUebung;
        }
    
        return mUebung;
    }

    constructor() {
        Uebung.StaticCheckMembers(this);
    }
}

export class StandardUebung {
    public Name: string;
    public StandardUebungName: StandardUebungsName;
    public Typ: UebungsTyp;
    public PrimaryMuscleGroup: MuscleGroupKategorie02;
    public SecondaryMuscleGroup: MuscleGroupKategorie02;
    public TertiaryMuscleGroup: MuscleGroupKategorie02;
    public QuaternaryMuscleGroup: MuscleGroupKategorie02;
    public QuinaryMuscleGroup: MuscleGroupKategorie02; 

    constructor(
        aName: string,
        aStandardUebungsName: StandardUebungsName,
        aTyp: UebungsTyp,
        aPrimaryMuscleGroup?: MuscleGroupKategorie02,
        aSecondaryMuscleGroup?: MuscleGroupKategorie02,
        aTertiaryMuscleGroup?: MuscleGroupKategorie02,
        aQuaternaryMuscleGroup?: MuscleGroupKategorie02,
        aQuinaryMuscleGroup?: MuscleGroupKategorie02
    ) {
        this.Name = aName;
        this.Typ = aTyp;
        this.StandardUebungName = aStandardUebungsName;
        aPrimaryMuscleGroup === undefined ? this.PrimaryMuscleGroup = MuscleGroupKategorie02.None : this.PrimaryMuscleGroup = aPrimaryMuscleGroup;
        aSecondaryMuscleGroup === undefined ? this.SecondaryMuscleGroup = MuscleGroupKategorie02.None : this.SecondaryMuscleGroup = aSecondaryMuscleGroup;
        aTertiaryMuscleGroup === undefined ? this.TertiaryMuscleGroup = MuscleGroupKategorie02.None : this.TertiaryMuscleGroup = aTertiaryMuscleGroup;
        aQuaternaryMuscleGroup === undefined ? this.QuaternaryMuscleGroup = MuscleGroupKategorie02.None : this.QuaternaryMuscleGroup = aQuaternaryMuscleGroup;
        aQuinaryMuscleGroup === undefined ? this.QuinaryMuscleGroup = MuscleGroupKategorie02.None : this.QuinaryMuscleGroup = aQuinaryMuscleGroup;
    }

    public static getStandardUebung(aStandardUebungsName: StandardUebungsName): StandardUebung{
        const mStandardUebung: StandardUebung = StandardUebungListe.find(u => u.StandardUebungName === aStandardUebungsName);
        return mStandardUebung;
    }
}

// Standardübungen, die bei ersten Start des Programms in die DB eingetragen werden.
export const StandardUebungListe: Array<StandardUebung> = new Array<StandardUebung>(
    new StandardUebung(
        'Squat',
        StandardUebungsName.Squat,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Quadriceps,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Hamstrings,
        MuscleGroupKategorie02.InnerAdductorMagnus),
    
    new StandardUebung(
        'Deadlift',
        StandardUebungsName.Deadlift,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Quadriceps,
        MuscleGroupKategorie02.Hamstrings,
        MuscleGroupKategorie02.LowerBack),
        
    new StandardUebung(
        'Bench-Press',
        StandardUebungsName.Benchpress,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Chest,
        MuscleGroupKategorie02.Triceps,
        MuscleGroupKategorie02.Shoulders
    ),

    new StandardUebung(
        'Overhead-Press',
        StandardUebungsName.OverheadPress,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps),

    new StandardUebung(
        'AB-Rollout',
        StandardUebungsName.AB_Rollout,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Abdominal,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps
    ),

    new StandardUebung(
        'AB-Wheel',
        StandardUebungsName.AB_Wheel,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Abdominal,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Shoulders,
        MuscleGroupKategorie02.Triceps
    ),

    new StandardUebung(
        'Back-Extension',
        StandardUebungsName.BackExtension,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back
    ),

    new StandardUebung(
        'Barbell-Row',
        StandardUebungsName.BarbellRow,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Bent-Over-Dumbbell-Raise',
        StandardUebungsName.BentOverDumbbellRaise,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Shoulders
    ),

    new StandardUebung(
        'Cable-Kick-Backs',
        StandardUebungsName.CableKickBacks,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Glutes,
        MuscleGroupKategorie02.Hamstrings
    ),
    
    new StandardUebung(
        'Cable-Push-Down',
        StandardUebungsName.CablePushDown,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Arms,
        MuscleGroupKategorie02.Triceps
    ),
    
    new StandardUebung(
        'Cable-Row',
        StandardUebungsName.CableRow,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Calf-Raises',
        StandardUebungsName.CalfRaises,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Calves
    ),

    new StandardUebung(
        'Chest-Supported-Rows',
        StandardUebungsName.ChestSupportedRows,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Chin-Ups',
        StandardUebungsName.ChinUps,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps
    ),

    new StandardUebung(
        'Lat-Pull-Downs',
        StandardUebungsName.LatPullDowns,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Biceps        
    ),

    new StandardUebung(
        'Pull-Ups',
        StandardUebungsName.PullUps,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Back,
        MuscleGroupKategorie02.Arms
    ),

    new StandardUebung(
        'Dips',
        StandardUebungsName.Dips,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Arms,
        MuscleGroupKategorie02.Triceps,
        MuscleGroupKategorie02.Chest,
        MuscleGroupKategorie02.Shoulders
    ),

    new StandardUebung(
        'Standing-Leg-Curls',
        StandardUebungsName.StandingLegCurls,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Legs,
        MuscleGroupKategorie02.Quadriceps,
        MuscleGroupKategorie02.Hamstrings
    ),

    new StandardUebung(
        'Neck-Extensions',
        StandardUebungsName.NeckExtensions,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Neck
    ),

    new StandardUebung(
        'Neck-Curls',
        StandardUebungsName.NeckCurls,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Neck
    ),

    new StandardUebung(
        'Triceps-Push-Down',
        StandardUebungsName.TricepsPushDown,
        UebungsTyp.Kraft,
        MuscleGroupKategorie02.Arms,
        MuscleGroupKategorie02.Triceps
    )
);