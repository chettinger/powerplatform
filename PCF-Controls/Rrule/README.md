---
title: Rrule PCF
author: Nick Gill
date: 7/01/2024
---
# Rrule PCF

This control enables the use of the rrule.js library inside of a Canvas app or Custom page. The control is not meant to render items in the UI; rather, it accepts inputs to produce a date/time series or an Rrule string. This simplifies the handling of recurrence rules for calendar dates.

https://github.com/jkbrzt/rrule

| Canvas apps | Custom pages | Model-driven apps | Portals |
| ----------- | ------------ | ----------------- | ------- |
| ✅           | ✅            | ⬜                 | ⬜       |

## Properties

### Input Properties

| Property name | Display name | Type  | Description |
| -------- | ----------- | -------------- | ---------- |
| `freq` (required) | Frequency | String | One of the following: Yearly, Monthly, Weekly, Daily. |
| `interval` | Interval | Whole number | The interval between each freq iteration. For example, when using Yearly, an interval of 2 means once every two years, but with Hourly, it means once every two hours. The default interval is 1.|
| `count` | Count | Whole number | How many occurrences will be generated |
| `bySetPos` | By Set Pos | Whole number | If given, it must be an integer, positive or negative. The given integer will specify an occurrence number, corresponding to the nth occurrence of the rule inside the frequency period. For example, a bysetpos of -1 if combined with a Monthly frequency, and a byweekday of (RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR), will result in the last work day of every month. |
| `startDate` | Start Date | Date/Time | The recurrence start. |
| `endDate` | End Date | Date/Time |  The last or until date |
| `byWeekDay` | By Weekday Day | String | If given, it must be either an integer (0 == RRule.MO), an array of integers, one of the weekday constants (RRule.MO, RRule.TU, etc), or an array of these constants. When given, these variables will define the weekdays where the recurrence will be applied.|
| `byMonth` | By Month | String | If given, it must be either an integer, or an array of integers, meaning the months to apply the recurrence to. |
| `byMonthDay` | By Month Day | String |  If given, it must be either an integer, or an array of integers, meaning the month days to apply the recurrence to. |
| `byYearDay` | By Year Day | String |  If given, it must be either an integer, or an array of integers, meaning the year days to apply the recurrence to. |


### Output Properties

| Property name | Display name | Type | Description |
| -------- | ----------- | -------------- | ---------- |
| `stringDateOutput` | Dates | String | The generated dates as a json string. |
| `rruleStringOutput` | RRULE String | String | The generated rrule string |
| `rruleTextOutput` | RRULE Text Output | String | Returns a natural language representation of the Rrule |
| `output` | Dates | Object | ? |


### Notes

The following options are available in the rrule.js library but have not been implemented as properties in the control: tzid, byweekno, byhour, byminute, bysecond, byeaster.