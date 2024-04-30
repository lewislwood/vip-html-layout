"use strict";

let lwKeyHandler: LwKeyHandler;

export const initKH = ()=> {
if (lwKeyHandler) return lwKeyHandler;
    lwKeyHandler = new LwKeyHandler();
    return lwKeyHandler  ;
}

export type KH_Key = { 
    name: string; 
    key:string ; 
    altKey: boolean; ctrlKey: boolean; shiftKey: boolean;
     metaKey: boolean; test: number; action?: Function; desc?: string ;
    };


class LwKeyHandler {
    private keyEnums = { altKey: 2, ctrlKey: 4, metaKey: 8, shiftKey: 16 }
    private _keyBlank: KH_Key = { name: "un-named", key: "", altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, test: 0, desc: "" };
    private keyTesters: KH_Key []= [];
    //@ts-ignore
    private _sayIt:Function = (message:string) =>{ const v = 0}; // Otherwords do nothing
    constructor(
        // This will log errors or general Info, Defaults to console.log
        private _logIt?: Function
    ) {
    }; //constructor

// If yo want keyhandler to announce the key handled , debug mainly
public set sayIt( sayKey: Function) {
    this._sayIt = sayKey;
}
public get sayIt(): Function {
    return this._sayIt;
}


    public set logIt( logger:Function) {
if (! logger) this._logIt = logger
else this._logIt = (message:string) => console.log(message);
    }// set logIt
    public get logIt(): Function {
        if (! this._logIt) this._logIt = (message:string) => console.log(message);
        return this._logIt;
    }
    public get newKeyBlank(): KH_Key {
     return JSON.parse(JSON.stringify(this._keyBlank));   
    }



    // Converts the event object into a bitwise number
    getKeyTest(ev:KH_Key | KeyboardEvent): number {
        const en = this.keyEnums;
        let test = 0;
        try {
            if (ev.altKey) test  +=  en.altKey;

            if (ev.ctrlKey) test += en.ctrlKey;
            if (ev.metaKey) test += en.metaKey;
            if (ev.shiftKey) test += en.shiftKey;
            return test;
        } catch (error:any) {
            this.sayIt(`TC.getTest error:  ${error.message}`);
        }; // catch
        return 0;
    }; // getKeyTest

    addKeyTest(kt:KH_Key) {
        kt.test = -1;
        if (kt.key) {
            kt.test = this.getKeyTest(kt);
            kt.key = (kt.shiftKey) ? kt.key.toUpperCase() : kt.key.toLowerCase();
        };
        const index = this.keyTesters.findIndex((k) => { return (k.name === kt.name); });
        if (index > -1) this.keyTesters[index] = kt
        else {
            this.keyTesters.push(kt);
        };
    }; // addKeyTest

    keyHandler(ev: KeyboardEvent) {
        const eTest = this.getKeyTest(ev), kt = this.keyTesters;
        let handled = false;
        try {

            for (let iKey = 0; iKey < kt.length; iKey++) {
                const k = kt[iKey];

                if (k.test > -1) {
                    if ((k.test === eTest) && (k.key === ev.key)) {
                        handled = true;
                        this.sayIt(`Handling key ${k.name}`);
                        if (k.action) k.action(ev);
                    };
                }; // if kt > -1
            }; // for

            if (handled) ev.preventDefault();
        } catch (error:any) {
            this.logIt(`KH error: ${error.message}  kt is ${JSON.stringify(kt)}`);
        };
    }; // keyHandler;

    start() {
        try {
            window.addEventListener("keyup", (ev) => { this.keyHandler(ev); });
        } catch (error:any) {
            this.logIt(`lwKeyHandler.start error: ${error.message}`);

        }; //catch
    };  // start

}; // class lwKeyHandler
