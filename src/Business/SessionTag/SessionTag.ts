import { Session, ISession } from 'src/Business/Session/Session';

export interface ISessionTag {
    TagID: number;
    SessionListe: Array<ISession>;
} 

export class SessionTag {
    TagID: number = 0;
    SessionListe: Array<ISession> = new Array<Session>();
}