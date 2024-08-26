import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ByWeekday, Frequency, RRule, Weekday, Options } from 'rrule';
import {DateTime} from 'luxon';
import { handleByDayInput } from './byDayMapping';

interface RuleOptions {
    freq?: Frequency;
    interval?: number;
    byweekday?: ByWeekday[];
    dtstart?: Date;
    until?: Date;
    bysetpos?: number;
    count?: number;
    wkst?: Weekday;
    bymonth?: [number];
    bymonthday?: [number];
    byyearday?: [number];
    tzid?: string;
}
export class rrulepcf implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
    private _dates: Date[];
    private _rruleStringOutput: string;
    private _rruleText: string;
    private _frequencyMapping: any;
    private _priorContextInput: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged: () => void;
    private inputStartDateV2: Date;
    private endDateV2: Date;
    public _debug: any;
    public _ruleOptions: RuleOptions;
    public _ruleOptionsV2: Options;


    /**
     * Empty constructor.
     */
    constructor() {
        
        this._ruleOptionsV2 = {
            freq: Frequency.YEARLY,
            dtstart: null,
            interval: 1,
            wkst: null,
            count: null,
            until: null,
            tzid: null,
            bysetpos: null,
            bymonth: null,
            bymonthday: null,
            byyearday: null,
            byweekday: null,
            byweekno: null,
            bynweekday: null,
            bynmonthday: null,
            byhour: null,
            byminute: null,
            bysecond: null,
            byeaster: null
        };
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = document.createElement("div");
        container.appendChild(this._container);
        this.notifyOutputChanged = notifyOutputChanged;

        this._frequencyMapping = {
            "Yearly": RRule.YEARLY,
            "Monthly": RRule.MONTHLY,
            "Weekly": RRule.WEEKLY,
            "Daily": RRule.DAILY
        };

        this.notifyOutputChanged();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>) {
        
        
            try {
                if (context.parameters.freq.raw) {
                    
                    // store the prior context input
                    this._priorContextInput = context;
                    // store temp value for old rrule string and compare to help limit the notifyOutputChanged
                    const oldRruleStringOutput = this._rruleStringOutput;

                    // handle input parameters
                    this._ruleOptionsV2.wkst = RRule.SU;
                    const inputFrequency: Frequency = this._frequencyMapping[context.parameters.freq.raw as keyof typeof this._frequencyMapping];
                    this._ruleOptionsV2.freq = inputFrequency;
                    
                    const inputInterval: number = context.parameters.interval?.raw ?? 1;
                    this._ruleOptionsV2.interval = inputInterval;

                    /*
                     Handling of ByDay input
                    */
                    let inputByWeekday: any;
                    if (context.parameters.byWeekDay.raw && typeof context.parameters.byWeekDay.raw === 'string') {
                        inputByWeekday = handleByDayInput(context.parameters.byWeekDay.raw);
                        this._ruleOptionsV2.byweekday = inputByWeekday;
                    }

                    /*
                    Building the rule options object
                    */

                    let ruleOptions: RuleOptions = {
                        freq: inputFrequency,
                        interval: inputInterval,
                        wkst: RRule.SU
                    };

                    // set start date & tzid
                    if (context.parameters.startDate.raw) {
                        const inputStartDate = context.parameters.startDate?.raw ?? new Date();
                        const startDateToUtc = new Date(Date.UTC(inputStartDate.getFullYear(), inputStartDate.getMonth(), inputStartDate.getDate(), inputStartDate.getHours(), inputStartDate.getMinutes(), inputStartDate.getSeconds()));
                        this._ruleOptionsV2.dtstart = startDateToUtc;

                        const inputStartDateLuxon = DateTime.fromJSDate(inputStartDate);
                        this._ruleOptionsV2.tzid = inputStartDateLuxon.zone.name;

                        ruleOptions.dtstart = this.inputStartDateV2;
                        ruleOptions.tzid = inputStartDateLuxon.zone.name;
                    }

                    if (context.parameters.endDate.raw && context.parameters.endDate.raw instanceof Date) {
                        const inputEndDate = context.parameters.endDate.raw;
                        const endDateToUtc = new Date(Date.UTC(inputEndDate.getFullYear(), inputEndDate.getMonth(), inputEndDate.getDate(), inputEndDate.getHours(), inputEndDate.getMinutes(), inputEndDate.getSeconds()));
                        this._ruleOptionsV2.until = endDateToUtc
                    }

                    if (context.parameters.count.raw && context.parameters.count.raw != 0) {
                        this._ruleOptionsV2.count = context.parameters.count.raw;
                    }

                    if (context.parameters.bySetPos.raw && context.parameters.bySetPos.raw != 0) {
                        this._ruleOptionsV2.bysetpos = context.parameters.bySetPos.raw;
                    }

                    if (context.parameters.byWeekDay.raw && context.parameters.byWeekDay.raw != "val") {
                        this._ruleOptionsV2.byweekday = inputByWeekday;
                    }
                    
                    if (context.parameters.byMonth.raw && context.parameters.byMonth.raw != "val" && context.parameters.byMonth.raw != "0") {
                        this._ruleOptionsV2.bymonth = JSON.parse(context.parameters.byMonth.raw);
                    }
                    

                    if (context.parameters.byMonthDay.raw && context.parameters.byMonthDay.raw != "val" && context.parameters.byMonthDay.raw) {
                        this._ruleOptionsV2.bymonthday = JSON.parse(context.parameters.byMonthDay.raw);
                    }

                    if (context.parameters.byYearDay.raw && context.parameters.byYearDay.raw != "val" && context.parameters.byYearDay.raw != "0") {
                        this._ruleOptionsV2.byyearday = JSON.parse(context.parameters.byYearDay.raw);
                    }

                    const rule = new RRule(
                        this._ruleOptionsV2);

                    /*
                    Assembling the outputs
                    */
                    
                    if((this._ruleOptionsV2.until == undefined || this._ruleOptionsV2.until == null) && (this._ruleOptionsV2.count == null || this._ruleOptionsV2.count === 0)) {
                        
                        // using a temp variable to prevent the setFullYear from recursively changing this.InputStartDateV2
                        const startDateTemp = new Date(this._ruleOptionsV2.dtstart || new Date());
                        let endDate = startDateTemp;
                        // add 2 years to the start date
                        endDate.setFullYear(endDate.getFullYear() + 2);
                            this._dates = rule.between(startDateTemp, endDate,true).map(date =>
                                DateTime.fromJSDate(date)
                                  .toUTC()
                                  .setZone('local', { keepLocalTime: true })
                                  .toJSDate());
                    } else {
                        this._dates = rule.all().map(date =>
                            DateTime.fromJSDate(date)
                              .toUTC()
                              .setZone('local', { keepLocalTime: true })
                              .toJSDate()
                            );

                    }
                    // update dates

                    this._rruleStringOutput = rule.toString();
                    this._rruleText = rule.toText();
                    //console.log("Dates: " + this._dates);
                    if (oldRruleStringOutput != this._rruleStringOutput) {
                        this.notifyOutputChanged();
                    }
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {

        //console.log("getOutputs");
        return {
            stringDateOutput: JSON.stringify(this._dates),
            rruleStringOutput: this._rruleStringOutput,
            rruleTextOutput: this._rruleText
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        this._container.remove();
    }
}
export { RRule };

