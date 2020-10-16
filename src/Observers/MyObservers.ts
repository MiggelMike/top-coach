export class MyObserver {
    public next: any = null;
    public error: any = null; // err; // = console.error('Observer got an error: ' + err);
    public complete: any = null; //  () => console.log('Observer got a complete notification'),

    constructor(aNext: any, aError: any, aComplete: any, aData: any) {
        this.next = aNext;
        this.error = aError;
        this.complete = aComplete;
    }
  };