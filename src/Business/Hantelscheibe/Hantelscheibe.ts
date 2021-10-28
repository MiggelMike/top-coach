export class IHantelscheibe  {
    ID: number;
    Name: string;
    Durchmesser: number;
    Gewicht: number;
}

export class Hantelscheibe implements  IHantelscheibe  {
    ID: number;
    Name: string = '';
    Durchmesser: number = 0;
    Gewicht: number = 0;
}
