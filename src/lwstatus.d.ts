export type MirrorMode = "none" | "quick-alert" | "quick-polite";
export type SayMode = "polite" | "alert";
export type OutSetting = {
    clrTime?: Date;
    time: number;
    size: number;
}
export type OutSettings = {
    quick: OutSetting;
    polite: OutSetting;
    alert: OutSetting;
}
export type ClearOutput = "polite" | "quick" | "alert";

export type StatusElements = {
    quick?: HTMLElement;
    polite?: HTMLElement;
    alert?: HTMLElement;
    demo?: HTMLDialogElement;
}

