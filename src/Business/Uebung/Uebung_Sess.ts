import { UebungsTyp, UebungsKategorie01, Uebung, IUebung } from './Uebung';
import { JsonProperty } from '@peerlancers/json-serialization';

export class Uebung_Sess extends Uebung {
    @JsonProperty()
    public StammuebungID: number = 0;
} 