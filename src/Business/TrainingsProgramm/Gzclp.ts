import { ITrainingsProgramm } from './TrainingsProgramm';
import { TrainingsProgramm } from './TrainingsProgramm';
import { IVorlageSession } from '../Session/Session';
import { VorlageSession } from '../Session/Session';
import { TrainingsSatz, VorlageSatz, ITrainingsSatz, IVorlageSatz } from '../Konfiguration/Satz';

export class GzclpProgramm extends TrainingsProgramm {
    constructor() {
        super();
        this.Tage = 4;
    }

    protected InitTag(aTagNr: number): Array<IVorlageSession> {
        const mSessions = new Array<IVorlageSession>();
        switch (aTagNr) {

            case 1:

                break;

            case 2:
                break;

            case 3:
                break;

            case 4:
                break;
        }
        return mSessions;
    }
}

export class GzclpVorlageSession extends VorlageSession {
    public Init(): void {
        throw new Error('Method not implemented.');
    }
}

export class GzclpT1Cycle0VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 5;
    }
}

export class GzclpT1Cycle0TrainingsSatz extends TrainingsSatz {}

export class GzclpT1Cycle1VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 3;
    }
}

export class GzclpT1Cycle1TrainingsSatz extends TrainingsSatz {}

export class GzclpT1Cycle2VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 1;
    }
}

export class GzclpT1Cycle2TrainingsSatz extends TrainingsSatz {}

export class GzclpT2Cycle0VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 10;
    }
}

export class GzclpT2Cycle0TrainingsSatz extends TrainingsSatz {}

export class GzclpT2Cycle1VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 8;
    }
}

export class GzclpT2Cycle1TrainingsSatz extends TrainingsSatz {}

export class GzclpT2Cycle2VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 6;
    }
}

export class GzclpT2Cycle2TrainingsSatz extends TrainingsSatz {}

export class GzclpT3VorlageSatz extends VorlageSatz {
    constructor() {
        super();
        this.WdhVorgabe = 15;
    }
}

export class GzclpT3TrainingsSatz extends TrainingsSatz {}

