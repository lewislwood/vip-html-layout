


import type { MirrorMode, 
    SayMode, 
    StatusElements, 
    OutSetting, 
    OutSettings, 
    ClearOutput } from "./lwstatus" 

/*
Project:  LW Status Message Handler

Date: February 10, 2024

Author: Lewis L. Wood
Description: Purpose to provide easy handling of status messages
for the Sighted as well as visually impaired.
*/
export const isStatusDefined = true;  
export class LwStatus {
    public get supportsDemo():boolean { return false};
// Quick Status typically is status area for sighted, screen readers will spiak it if no other status area is available
protected elements: StatusElements = {};
private _mirrorMode: MirrorMode = "quick-alert";
// Typically an area unseen by sighted and specifically for blind.  css Hidden area
public defaultSayIt:SayMode = "alert";
protected lastOutput: OutSettings  = {
    quick: {  time: 5000, size: 0},
    polite: {  time: 4000, size: 200 }, 
    alert: {  time: 8000, size: 0} 
    }; 
    
// Used for logging or Loggers, debugging
public log: Function = (message: string) => console.log(message); 
constructor(
    quickOrId: HTMLElement | string = "lw-status-message",
    alertOrId: HTMLElement | string = "lw-alert-status",
    politeOrId: HTMLElement | string = "lw-polite-status"
){
    this.setElement("quick",quickOrId);
    this.setElement("alert",alertOrId);
    this.setElement( "polite",politeOrId);
} // constructor

//  Launch a TimeoutTimer if warranted by settings
private async launchClearTimer( mode: ClearOutput) {
    let out: OutSetting = this.lastOutput[mode];

    // Do we want a timer
    if (out.time > 0) {
let t = new Date();
// Set time to clear
  t.setMilliseconds( t.getMilliseconds() + out.time);
        this.lastOutput[mode].clrTime = t;
        const ct = () =>{ this.clearTime(mode)};
        setTimeout(ct,this.lastOutput[mode].time);

    }
} // launchClearTimer

// Timeout calls this metod to clear output
    private async clearTime( mode: ClearOutput) {
    const d = new Date();
    if ( d > this.lastOutput[mode].clrTime!) this.clear(mode);    ;
    } // clearTime

    // Clears an output element
    public clear( mode:ClearOutput, notice: boolean = false) {

        const e = this.elements[mode];
try {

            if (e) { 
                e.innerHTML = "";
    if (notice) e.innerHTML = `${mode} messages cleared...`;
};
} catch(err:any) {
    this.log(`lwStatus.clear [${mode}]: ${err.message}`);

} //catch

} // clearTime

public set mirror( mode:MirrorMode) {
this._mirrorMode = mode;
} // mirror
public get mirror(): MirrorMode {
    return this._mirrorMode;
}
    public setElement (mode: ClearOutput,elementOrID: HTMLElement | string) {
        if (typeof elementOrID=== "string") this.elements[mode] = <HTMLElement>document.getElementById(elementOrID)
        else         this.elements[mode] = elementOrID as HTMLElement;
} // setElement

public async quick( message: string, mode?: MirrorMode) {
    try {
    const m = mode ?? this.mirror;
    if ( this.elements.quick) this.elements.quick.innerHTML = message;
    if (m === "quick-polite") this.polite(message)
        else if (m === "quick-alert") this.alert(message);
    this.launchClearTimer("quick");
} catch (err: any) {
    console.log(`SM.quick error: ${err.message}  msg: ${message}`);
     //catch
}


} // quick

public async polite( message: string) {
    if (this.elements.polite) { 
        let sz = this.lastOutput.polite.size, h = `${message}<br>${this.elements.polite.innerHTML}`;
        if (sz > 0) h = h.substr(0, sz); 
        this.elements.polite.innerHTML = h;
        this.launchClearTimer("polite");
    }
    else {
        if (this.elements.alert != undefined) this.alert(message)
        else this.log(`lwStatusMessage: No poite or Alert defined unable to say: ${message}`);
    }
} // polite
    public async alert(message: string) {
        if (this.elements.alert) {
            let sz = this.lastOutput.alert.size, h = `${message}<br>${this.elements.alert.innerHTML}`;
            if (sz > 0)  h = h.substr(0, sz);
            this.elements.alert.innerHTML = h;
            this.launchClearTimer("alert");
        }
        else {
            if (this.elements.alert) this.alert(message)
            else this.log(`lwStatusMessage: No poite or Alert defined unable to say: ${message}`);
        }
    } // alert

public async sayIt( message: string, mode: SayMode) {
const m = mode ?? this.defaultSayIt;
if (m === "alert") this.alert(message)
else this.polite(message);
} //sayIt

// Opens dialog with options to demo the LW Status class handler
public async clearAll( notice: boolean = false) {
    this.clear("quick");
    await this.clear("polite", notice);
    await this.clear("alert", notice);
} // clearAll


} // Class LwStatusMessage

let lwSM:LwStatus; 

export const initSM = (
    quickOrId: HTMLElement | string = "lw-status-message",
    alertOrId: HTMLElement | string = "lw-alert-status",
    politeOrId: HTMLElement | string = "lw-polite-status"    
): LwStatus  =>{
    if (!lwSM) lwSM = new LwStatus(quickOrId,
        alertOrId,
        politeOrId        
        ); 
        return lwSM;
}

