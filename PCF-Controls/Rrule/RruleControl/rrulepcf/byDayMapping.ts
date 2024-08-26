// byDayMapping.ts

import { RRule, Weekday } from 'rrule';

const _weekdayMapping: { [key: string]: Weekday } = {
    "Sunday": RRule.SU,
    "Monday": RRule.MO,
    "Tuesday": RRule.TU,
    "Wednesday": RRule.WE,
    "Thursday": RRule.TH,
    "Friday": RRule.FR,
    "Saturday": RRule.SA
};

export function handleByDayInput(rawByDay: string): Weekday[] {
    if (rawByDay && typeof rawByDay === 'string') {
        let inputByWeekday = rawByDay; // "Sunday,Monday"
        let inputRawByDay = inputByWeekday.split(","); // ["Sunday", "Monday"]
        // Check if rawByDay is not null and is an array
        if (inputRawByDay && Array.isArray(inputRawByDay)) {
            // Map the input to the RRule weekdays
            let mappedByDay = inputRawByDay.map(day => _weekdayMapping[day]);
            return mappedByDay;
        }
    }
    return [];
}