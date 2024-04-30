

import {  LwStatus} from "./lwStatus";

import type {
    MirrorMode,
} from "./lwstatus.d"

/*
Project:  LW Status Message Handler

Date: February 10, 2024

Author: Lewis L. Wood
Description: Purpose to provide easy handling of status messages
for the Sighted as well as visually impaired.
*/
export const isStatusDefined = true;
export class LwStatusDemo extends LwStatus {
    public get supportsDemo(): boolean { return true};

    constructor(
        quickOrId: HTMLElement | string, 
        alertOrId: HTMLElement | string, 
        politeOrId: HTMLElement | string 
    ) {
        super(
            quickOrId,            alertOrId,            politeOrId 
            );
    } // constructor
    
    // Opens dialog with options to demo the LW Status class handler
    public async clearAll(notice: boolean = false) {
        this.clear("quick");
        await this.clear("polite", notice);
        await this.clear("alert", notice);
    } // clearAll

    public async demo() {
        let dlg = this.elements.demo;
        if (!dlg) await this.demoInit();
        await this.clearAll(true);
        dlg = this.elements.demo;
        if (dlg) dlg.show();
    } // demo

    private async demoClose() {
        // await this.clearAll(false);
        const dlg = <HTMLDialogElement>this.elements.demo;
        if (dlg) {
            this.quick("Closing Dialog");
            await dlg.close("");
            dlg.open = false;
        };
    } // demoClose

    // Finds dialog or creates one.  Fills either with the demo controls
    private async demoInit() {

        let dlg = <HTMLDialogElement>document.getElementById(`sm-demo-dialog`);
        if (!dlg) {
            // Just create the dialog element apparently they do not care where it shows up.  Modal does not matter anyway
            dlg = document.createElement("dialog");
            dlg.setAttribute("id", "sm-demo-dialog");

            const cp = <HTMLDivElement>document.getElementById("centerpoint")!;
            cp.appendChild(dlg);
            this.elements.demo = dlg;
        };
        // dlg.classList.add("sm-demo-dialog");

        dlg.innerHTML = this.demoHTML();

        const txt = <HTMLInputElement>dlg.querySelector("#sm-test-msg")!,
            isSpoken = <HTMLInputElement>dlg.querySelector("#sm-is-spoken")!,
            qk = <HTMLButtonElement>dlg.querySelector("#sm-quick-btn")!,
            qkClr = <HTMLInputElement>dlg.querySelector("#sm-quick-clear-time")!,
            mr = <HTMLSelectElement>dlg.querySelector("#sm-dlg-mirror")!,
            pol = <HTMLButtonElement>dlg.querySelector("#sm-polite-btn")!,
            polClr = <HTMLInputElement>dlg.querySelector("#sm-polite-clear-time")!,
            polSize = <HTMLInputElement>dlg.querySelector("#sm-polite-size")!,
            alr = <HTMLButtonElement>dlg.querySelector("#sm-alert-btn")!,
            alrClr = <HTMLInputElement>dlg.querySelector("#sm-alert-clear-time")!,
            alrSize = <HTMLInputElement>dlg.querySelector("#sm-alert-size")!,
            cla = <HTMLButtonElement>dlg.querySelector("#sm-clear-all-btn")!,
            notify = <HTMLInputElement>dlg.querySelector("#sm-clear-al-notify")!,
            cls = <HTMLButtonElement>dlg.querySelector("#sm-dlg-close-btn")!
        // Be sure to escape input from user.
        const esc = /[><{}\n\[\]& ^]/g;
        const stMsg = () => { return txt.value.replace(esc, ""); };
        const defStatus = () => { if (txt.value.trim() === "") txt.value = "Default text message"; }

        //  event
        txt.addEventListener("blur", defStatus);
        qk.addEventListener("click", () => { this.quick(stMsg()) });
        qkClr.addEventListener("blur", () => { this.lastOutput.quick.time = Number(qkClr.value) });
        mr.addEventListener("change", () => { this.mirror = mr.value as MirrorMode; })
        pol.addEventListener("click", () => { this.polite(stMsg()) });
        polClr.addEventListener("blur", () => { this.lastOutput.polite.time = Number(polClr.value) });
        polSize.addEventListener("blur", () => { this.lastOutput.polite.size = Number(polSize.value) });
        alr.addEventListener("click", () => { this.alert(stMsg()) });
        alrClr.addEventListener("blur", () => { this.lastOutput.alert.time = Number(alrClr.value) });
        alrSize.addEventListener("blur", () => { this.lastOutput.alert.size = Number(alrSize.value) });
        cla.addEventListener("click", () => { this.clearAll(notify.checked) });
        cls.addEventListener("click", () => { this.demoClose(); });

        const qe = this.elements.quick!;
        const chRole = () => {
            if (isSpoken.checked) qe.setAttribute("role", "alert")
            else qe.setAttribute("role", "heading")
        }
        isSpoken.addEventListener("change", chRole);

    } // demoInit

    private demoHTML(): string {
        return `
            <div class="sm-dlg-hdr">

<h5>Status Messages Demo of Handler</h5>

<p>
    This will demo the Status Message Handler.  
    All of the various permutations.  
    You can adjust the settings and hear the output.  
    Quick is actually visible to the sighted at the top of the page.  
    You can choose to mirror that output or have the screen reader automatically speak what is output there. 
    You  may want to manually output a different description to the visually impaired with a screen reader.
</p>
<p>
    *** Sighted you may want enable  the screen reader in Windows to understand. 
    &lt;ctrl&gt;+&lt;alt&gt;+&lt;enter&gt; toggles Windows narrator off or on most computers.  Otherwise, accessiblity settings to enable these hotkeys/feature. &lt;enter&gt;&nbsp;&lt;ctrl&gt;&nbsp; Once you enable the &lt;ctrl&gt; will hush up the computer when talking too much for your taste.</ctrl>
</p>
<P>
    Getting and setting the perfect balance is a key to a most succesful website or app that is accessible to the visually impaired. 
    Sighted do not want to see too much details, since it is obvious to them by graphics or display on the screen. 
    Blind as well want quick and succinct details & description. Too much they hear a whole bunch of talking and grow weary of a site or app that is too wordy.  
    That is why sighted and blind alike need too understand these concepts.
</P>
</div>
<div class="sm-dlg-body">
    <span class="sm-dlg-grid-line">
        <label for="sm-test-msg">Test message: </label>
<input type="text" id="sm-test-msg" value=""Enter message to speak"" autofocus>
    </span>

    <span class="sm-dlg-grid-line">
<label >Visible Status </label>
<input type="checkbox" id="sm-is-spoken"checked="true">
<label for="sm-is-spoken">Is Spoken&nbsp;</label>
<button id="sm-quick-btn">Quick</button>
<label for="sm-quick-clear-time">Clear Time (ms)</labelsm-quick-clear-time>
<input type="number" id="sm-quick-clear-time" class="sm-inp-6" max="10000" value="10000" >
<label for="sm-dlg-mirror">Mirror to </label>
<select id="sm-dlg-mirror"   name="mirror-mode" id="mirror-mode" >
<option value="none">None</option>
<option value="quick-polite" selected>Polite</option>
<option value="quick-alert">Alert</option>
</select>
</span>
<span class="sm-dlg-grid-line">
    <label >Polite Status </label>
<button id="sm-polite-btn">Polite</button>
<label for="sm-polite-clear-time">Clear Time (ms)</label>
    <input type="number" id="sm-polite-clear-time" class="sm-inp-6   max="90000" value="350">
    <label for="sm-polite-size">Max Size</label>
        <input type="number" id="sm-polite-size" class="sm-inp-4" max="999"   value="200">
</span>
<span class="sm-dlg-grid-line">
    <label>Alert&nbsp;&nbsp;Status </label>
    <button id="sm-alert-btn">Alert&nbsp;</button>
    <label for="sm-alert-clear-time">Clear Time (ms)</label>
    <input type="number" id="sm-alert-clear-time" class="sm-inp-6"  max="90000" value="30000">
    <label for="sm-alert-size">Max Size</label>
    <input type="number" id="sm-alert-size" class="sm-inp-4" max="999" value="800">
</span>
<!-- sm-dlg-body -->
</div>
<div class="sm-dlg-ftr">
    <SPAN>
    <button id="sm-clear-all-btn">Clear All</button>
    <label for="sm-clear-al-notify">&nbsp;and Notify&nbsp;</label>
    <input type="checkbox" id="sm-clear-al-notify"  checked="true"   >
    </SPAN>
    <form method="dialog">
<button type="dialog"    id="sm-dlg-close-btn" alt="Close status Demo">Close</button>
</form>
</div>

    `
    } // demoHTML

} // Class LwStatusMessage

// Go ahead and instatiateUser can change the HTmLElement settings the setQuick, setPolite(, alert(, log))
let lwSM:LwStatusDemo ;
export const initSM = (
    quickOrId: HTMLElement | string = "lw-status-message",
    alertOrId: HTMLElement | string = "lw-alert-status",
    politeOrId: HTMLElement | string = "lw-polite-status"
): LwStatusDemo => {
    if (!lwSM) lwSM = new LwStatusDemo(quickOrId,
        alertOrId,
        politeOrId
    );
    return lwSM;
}



