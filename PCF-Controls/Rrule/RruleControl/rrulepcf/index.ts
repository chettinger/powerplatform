import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ByWeekday, Frequency, RRule, Weekday } from 'rrule';
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
    byweekno?: null,
    bynweekday?: null,
    bynmonthday?: null,
    byhour?: null,
    byminute?: null,
    bysecond?: null,
    byeaster?: null
    }

export class rrulepcf implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
    private _dates: any;
    private _rruleStringOutput: string;
    private _rruleText: string;
    private _frequencyMapping: any;
    private notifyOutputChanged: () => void;


    public _debug: any;
    public ruleOptions: RuleOptions;

    /**
     * Empty constructor.
     */
    constructor() {
        
        
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
            "Daily": RRule.DAILY,
            "Hourly": RRule.HOURLY,
            "Minutely": RRule.MINUTELY,
            "Secondly": RRule.SECONDLY
        };
        this.ruleOptions = {
            freq: RRule.YEARLY,
            interval: 1,
            wkst: RRule.SU
        };

        this.notifyOutputChanged();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>) {
        
        
            try {   

                    // store temp value for old rrule string and compare to help limit the notifyOutputChanged
                    const oldRruleStringOutput = this._rruleStringOutput;
                    // map input values to rule options - this has been shifted to separate mapInputsToRuleOptions function for better readability
                    this.ruleOptions = this.mapInputsToRuleOptions(context);
                    
                    const rule = new RRule(
                        this.ruleOptions);

                    // if no end date is set, default to 2 years                    
                    if((this.ruleOptions.until == undefined || this.ruleOptions.until == null) && (this.ruleOptions.count == null || this.ruleOptions.count === 0)) {
                        
                        // using a temp variable to prevent the setFullYear from recursively changing this.InputStartDateV2
                        const startDate = new Date(this.ruleOptions.dtstart || new Date());
                        const endDateTemp = new Date(this.ruleOptions.dtstart || new Date());
                        
                        let endDate = endDateTemp;
                        
                        // add 2 years to the start date
                        endDate.setFullYear(endDate.getFullYear() + 2);
                        this._dates = rule.between(startDate, endDate,true).map(date =>
                            DateTime.fromJSDate(date)
                                .toUTC()
                                .setZone('local', { keepLocalTime: true })
                                .toJSDate());
                                console.log('this._dates: ' + this._dates);
                                // console.log('all dates: ' + rule.all());
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

                    if (oldRruleStringOutput != this._rruleStringOutput) {
                        this.notifyOutputChanged();
                    }
                    
                    console.log(JSON.stringify(this.ruleOptions));
            } catch (error) {
                console.error('An error occurred:', error);
            }
    }

    private mapInputsToRuleOptions(context: ComponentFramework.Context<IInputs>) {
                    /*
                    Building the rule options object
                    */

                    // handle input parameters
                   
                    const inputFrequencyV2: Frequency = this._frequencyMapping[context.parameters.freq.raw as keyof typeof this._frequencyMapping];
                    const inputInterval: number = context.parameters.interval?.raw ?? 1;
                    const ruleOptions: RuleOptions = {
                        //freq: inputFrequency,
                        freq: inputFrequencyV2,
                        interval: inputInterval,
                        wkst: RRule.SU
                    };
                    
                    
                   /*
                     Handling of ByDay input
                    */
                     if (context.parameters.byWeekDay.raw && typeof context.parameters.byWeekDay.raw === 'string' && context.parameters.byWeekDay.raw != "val") {
                         ruleOptions.byweekday = handleByDayInput(context.parameters.byWeekDay.raw);
                     }

                    // set start date & tzid
                    if (context.parameters.startDate.raw) {
                        const inputStartDate = context.parameters.startDate?.raw ?? new Date();
                        const startDateToUtc = new Date(Date.UTC(inputStartDate.getFullYear(), inputStartDate.getMonth(), inputStartDate.getDate(), inputStartDate.getHours(), inputStartDate.getMinutes(), inputStartDate.getSeconds()));
                       // this.ruleOptions.dtstart = startDateToUtc;
                        ruleOptions.dtstart = startDateToUtc;

                        const inputStartDateLuxon = DateTime.fromJSDate(inputStartDate);
                      //  this.ruleOptions.tzid = inputStartDateLuxon.zone.name;
                        ruleOptions.tzid = inputStartDateLuxon.zone.name;
                    }

                    if (context.parameters.endDate.raw && context.parameters.endDate.raw instanceof Date) {
                        const inputEndDate = context.parameters.endDate.raw;
                        const endDateToUtc = new Date(Date.UTC(inputEndDate.getFullYear(), inputEndDate.getMonth(), inputEndDate.getDate(), inputEndDate.getHours(), inputEndDate.getMinutes(), inputEndDate.getSeconds()));
                     //   this.ruleOptions.until = endDateToUtc
                        ruleOptions.until = endDateToUtc;
                    }

                    if (context.parameters.count.raw && context.parameters.count.raw != 0) {
                      //  this.ruleOptions.count = context.parameters.count.raw;
                        ruleOptions.count = context.parameters.count.raw;
                    }

                    if (context.parameters.bySetPos.raw && context.parameters.bySetPos.raw != 0) {
                      //  this.ruleOptions.bysetpos = context.parameters.bySetPos.raw;
                        ruleOptions.bysetpos = context.parameters.bySetPos.raw;
                    }
                    
                    if (context.parameters.byMonth.raw && context.parameters.byMonth.raw != "val" && context.parameters.byMonth.raw != "0") {
                       // this.ruleOptions.bymonth = JSON.parse(context.parameters.byMonth.raw);
                        ruleOptions.bymonth = JSON.parse(context.parameters.byMonth.raw);
                    }
                    
                    if (context.parameters.byMonthDay.raw && context.parameters.byMonthDay.raw != "val" && context.parameters.byMonthDay.raw && context.parameters.byMonthDay.raw != "0") {
                       // this.ruleOptions.bymonthday = JSON.parse(context.parameters.byMonthDay.raw);
                        ruleOptions.bymonthday = JSON.parse(context.parameters.byMonthDay.raw);
                    }

                    if (context.parameters.byYearDay.raw && context.parameters.byYearDay.raw != "val" && context.parameters.byYearDay.raw != "0") {
                       // this.ruleOptions.byyearday = JSON.parse(context.parameters.byYearDay.raw);
                        ruleOptions.byyearday = JSON.parse(context.parameters.byYearDay.raw);
                    }

    return ruleOptions
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

