import { ITrainingsProgramm } from './TrainingsProgramm';

export class Gzclp implements ITrainingsProgramm {
    public ID: number;
    Init(): Array<ISession> {
        const mSessions = new Array<ISession>();
        throw new Error('Method not implemented.');
    }
}

abstract class GzclpSatz extends Satz {}

export class GzclpT1Cycle0Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 5;
    }
}

export class GzclpT1Cycle1Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 3;
    }
}

export class GzclpT1Cycle2Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 1;
    }
}

export class GzclpT2Cycle0Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 10;
    }
}

export class GzclpT2Cycle1Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 8;
    }
}

export class GzclpT2Cycle2Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 6;
    }
}

class GzclpT3Satz extends GzclpSatz {
    constructor() {
        super();
        this.WdhVorgabe = 15;
    }
}
