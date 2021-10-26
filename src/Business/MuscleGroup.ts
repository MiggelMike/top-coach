
interface IMuscleGroup {
    ID: number;
    Name: string;
    Bemerkung: string;
}

class MuscleGroup implements IMuscleGroup {
    ID: number;
    Name: string;
    Bemerkung: string;

    constructor(){}
}