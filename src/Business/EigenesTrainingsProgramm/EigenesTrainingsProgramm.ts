import { ISession } from '../Session/Session';
import { TrainingsProgramm, ITrainingsProgramm } from '../TrainingsProgramm/TrainingsProgramm';
import { deserialize } from '@peerlancers/json-serialization';

export class EigenesTrainingsProgramm extends TrainingsProgramm implements ITrainingsProgramm {
    protected InitSession(aSessionNr: number): ISession[] {
        throw new Error('Method not implemented.');
    }

    public override DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
		const s = deserialize(EigenesTrainingsProgramm, aJsonData);
		return s;
	}

}