import { RRule } from './index'; // Adjust the import path according to your project structure
import { rrulepcf } from './index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "./generated/ManifestTypes";
import {getByTestId} from '@testing-library/dom';
import  '@testing-library/jest-dom';

describe('PCF Control Tests', () => {
  
  let pcfControl: any; // This will be an instance of your PCF control class
  const context = mock<ComponentFramework.Context<IInputs>>();
  document.body.innerHTML = '<div data-testid="container"></div>';
  const container = getByTestId( document.body, "container") as  HTMLDivElement;
  const outputChanged = jest.fn();
  const state = mock<ComponentFramework.Dictionary>();

  beforeEach(() => {
    // Setup your PCF control instance before each test
    // Mock the context and any other dependencies
    
    // Create an instance of your control
    pcfControl= new rrulepcf();
    
    // Mock the input properties
    context.parameters = mock<IInputs>();

    // init control
    pcfControl.init(context,outputChanged,state,container);
    
  });



  test('Set Freq to Yearly eq Rrule.YEARLY', () => {
    // set mock parameters & call updateView()
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = new Date();
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.freq).toEqual(RRule.YEARLY);
  });

  test('Set Freq to Weekly eq Rrule.WEEKLY', () => {
    // set mock parameters & call updateView()
    context.parameters.freq.raw = 'Weekly';
    context.parameters.startDate.raw = new Date();
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.freq).toEqual(RRule.WEEKLY);
  });

  test('Set Freq to Monthly eq Rrule.MONTHLY', () => {
    // set mock parameters & call updateView()
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = new Date();
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.freq).toEqual(RRule.MONTHLY);
  });

  test('Set Freq to Daily eq Rrule.DAILY', () => {
    // set mock parameters & call updateView()
    context.parameters.freq.raw = 'Daily';
    context.parameters.startDate.raw = new Date();
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.freq).toEqual(RRule.DAILY);
  });

  test('_RuleOptionsV2 should have interval set to 1 if interval is not provided', () => {
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = new Date();
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.interval).toEqual(1);
  });
  test('_RuleOptionsV2 should have interval set to 2 if interval of 2 is provided', () => {
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = new Date();
    context.parameters.interval.raw = 2;
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.interval).toEqual(2);
  });
  
  test('_RuleOptionsV2 should have byWeekDay set to Rrule.SU if byWeekDay of "Sunday" is provided', () => {
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = new Date();
    context.parameters.byWeekDay.raw = 'Sunday';
    pcfControl.updateView(context);
    expect(pcfControl._ruleOptionsV2.byweekday).toEqual([RRule.SU]);
  });
  test('start date should result in expected start date option', () => {
    //const startDate = new Date("2024-07-28T04:32:00.000-04:00");
    const startDate = new Date("2024-08-01T03:30:00.000Z");
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = startDate;
    pcfControl.updateView(context);
    console.log("startDate: " + startDate);
    console.log("context.parameters.startDate.raw" + context.parameters.startDate.raw);
    console.log("_ruleOptions.dtstart: " + pcfControl._ruleOptionsV2.dtstart);
    
    //expect(pcfControl._ruleOptions.dtstart).toEqual(startDate);
  });

/*
  test('daily frequency with start date of 8/1/2024 12:00 AM repeating every 1 day until 8/3/2024 should result in 3 dates generated: 8/1/2024, 8/2/2024, 8/3/2024', () => {
    const startDate = new Date("2024-08-01T00:00:00.000-04:00");
    const untilDate = new Date("2024-08-03T00:00:00.000-04:00");
    context.parameters.freq.raw = 'Daily';
    context.parameters.startDate.raw = startDate;
    context.parameters.endDate.raw = untilDate;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-08-02T00:00:00.000-04:00"), untilDate]);
  });

  test('Manilla timezone; daily frequency with start date of 8/1/2024 12:00 AM repeating every 1 day until 8/3/2024 should result in 3 dates generated: 8/1/2024, 8/2/2024, 8/3/2024', () => {
    const startDate = new Date("2024-08-01T00:00:00.000+08:00");
    const untilDate = new Date("2024-08-03T00:00:00.000+08:00");
    context.parameters.freq.raw = 'Daily';
    context.parameters.startDate.raw = startDate;
    context.parameters.endDate.raw = untilDate;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-08-02T00:00:00.000+08:00"), untilDate]);
  });

  test('monthly frequency with start date of 8/1/2024 1:00 pm repeating every 1 month on 1st of each month end after 4 occurrences should result in 4 dates generated: 8/1/2024, 9/1/2024, 10/1/2024, 11/1/2024', () => {
    const startDate = new Date("2024-08-01T13:00:00.000-04:00");
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = startDate;
    context.parameters.count.raw = 4;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-09-01T13:00:00.000-04:00"), new Date("2024-10-01T13:00:00.000-04:00"), new Date("2024-11-01T13:00:00.000-04:00")]);
  });

  test('monthly frequency with start date of 8/1/2024 2:00 pm repeating every 1 month on 1st of each month end after 4 occurrences should result in 4 dates generated: 8/1/2024, 9/1/2024, 10/1/2024, 11/1/2024', () => {
    const startDate = new Date("2024-08-01T14:00:00.000-04:00");
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = startDate;
    context.parameters.count.raw = 4;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-09-01T14:00:00.000-04:00"), new Date("2024-10-01T14:00:00.000-04:00"), new Date("2024-11-01T14:00:00.000-04:00")]);
  });
  test('monthly frequency with start date of 8/1/2024 3:00 pm repeating every 1 month on 1st of each month end after 4 occurrences should result in 4 dates generated: 8/1/2024, 9/1/2024, 10/1/2024, 11/1/2024', () => {
    const startDate = new Date("2024-08-01T15:00:00.000-04:00");
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = startDate;
    context.parameters.count.raw = 4;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-09-01T15:00:00.000-04:00"), new Date("2024-10-01T15:00:00.000-04:00"), new Date("2024-11-01T15:00:00.000-04:00")]);
  });
  test('monthly frequency with start date of 8/1/2024 4:00 pm repeating every 1 month on 1st of each month end after 4 occurrences should result in 4 dates generated: 8/1/2024, 9/1/2024, 10/1/2024, 11/1/2024', () => {
    const startDate = new Date("2024-08-01T16:00:00.000-04:00");
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = startDate;
    context.parameters.byMonthDay.raw = '1';
    context.parameters.count.raw = 4;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-09-01T16:00:00.000-04:00"), new Date("2024-10-01T16:00:00.000-04:00"), new Date("2024-11-01T16:00:00.000-04:00")]);
  });
  test('yearly frequency with start date of 8/1/2024 4:00 pm repeating every August 1st and ending after 4 occurences should result in 4 dates generated: 8/1/2024, 8/1/2025, 8/1/2026, 8/1/2027', () => {
    const startDate = new Date("2024-08-01T16:00:00.000-04:00");
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = startDate;
    context.parameters.count.raw = 4;
    context.parameters.byMonth.raw = '8';
    context.parameters.byMonthDay.raw = '1';
    context.parameters.interval.raw = 1;
    //context.parameters.byYearDay.raw = '1';
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2025-08-01T16:00:00.000-04:00"), new Date("2026-08-01T16:00:00.000-04:00"), new Date("2027-08-01T16:00:00.000-04:00")]);
  });
  */
 /*
  test(' test 4monthly frequency with start date of 8/1/2024 10:30 pm repeating every 1 month on 1st of each month end after 4 occurrences should result in 4 dates generated: 8/1/2024, 9/1/2024, 10/1/2024, 11/1/2024', () => {
    const startDate = new Date("2024-08-01T03:30:00.000Z");
    context.parameters.freq.raw = 'Monthly';
    context.parameters.startDate.raw = startDate;
    context.parameters.byMonthDay.raw = '1';
    context.parameters.count.raw = 4;
    pcfControl.updateView(context);
    console.log("_dates: " + pcfControl._dates);
    expect(pcfControl._dates).toEqual([startDate, new Date("2024-09-01T22:30:00.000-04:00"), new Date("2024-10-01T22:30:00.000-04:00"), new Date("2024-11-01T22:30:00.000-04:00")]);
  });*/

/*
  test('should calculate dates for two years if until and count are not provided', () => {
    context.parameters.freq.raw = 'Yearly';
    context.parameters.startDate.raw = new Date();
    //const startDate = new Date();
    //pcfControl._inputStartDate = startDate;
    //const mockContext = {}; // Minimal context to trigger the logic
    pcfControl.updateView(context);
    
    
    // Assuming your control has a method to get _dates for testing
    expect(pcfControl._dates).toBeDefined();
    expect(pcfControl._dates.length).toBeGreaterThan(0); // Or any other assertion based on your logic
  });
  */
/*
  test('should call notifyOutputChanged when _rruleStringOutput changes', () => {
    const mockContext = {}; // Setup your context
    // Mock notifyOutputChanged to track its calls
    pcfControl.notifyOutputChanged = jest.fn();
    pcfControl.updateView(mockContext);
    expect(pcfControl.notifyOutputChanged).toHaveBeenCalled();
  });
  

  // Add more tests as needed
});
*/
/*
describe('RRule functionality', () => {
    it('should generate correct RRule string', () => {

        const ruleOptions = {
            
            freq: RRule.YEARLY,
            interval: 1,
            dtstart: new Date(),
            bymonth: 1,
            bymonthday: 1,
            wkst: RRule.SU
        };
        const rule = new RRule(ruleOptions);
        expect(rule.toString()).toBe('RRULE:DTSTART:20240715T213600Z;FREQ=YEARLY;INTERVAL=1;BYMONTH=1;BYMONTHDAY=1;WKST=SU');
    });
    */
});