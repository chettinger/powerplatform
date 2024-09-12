---
title: Rrule PCF
author: Nick Gill
date: 7/01/2024
---
# Rrule PCF

Inspiration/description here

| Canvas apps | Custom pages | Model-driven apps | Portals |
| ----------- | ------------ | ----------------- | ------- |
| ✅           | ✅            | ⬜                 | ⬜       |

## Properties

### Input Properties

| Property name | Display name | Type | Required | Description |
| -------- | ----------- | -------------- | ---------- | ------- |
| `freq` | Frequency | String | Yes | One of the following: Yearly, Monthly, Weekly, Daily. |
| `interval` | Interval | Whole number | ? | The interval between each freq iteration. For example, when using Yearly, an interval of 2 means once every two years, but with Hourly, it means once every two hours. The default interval is 1.|
| `count` | Count | Whole number | ? | How many occurrences will be generated |
| `bySetPos` | By Set Pos | Whole number | ? | ? |
| `startDate` | Start Date | Date/Time | ? | The recurrence start. Besides being the base for the recurrence, missing parameters in the final recurrence instances will also be extracted from this date. |
| `endDate` | End Date | Date/Time | ? | The last or until date |
| `byWeekDay` | By Weekday Day | String | ? | ? |
| `byMonth` | By Month | String | ? | ? |
| `byMonthDay` | By Month Day | String | ? | ? |
| `byYearDay` | By Year Day | String | ? | ? |


### Output Properties

| Property name | Display name | Type | Description |
| -------- | ----------- | -------------- | ---------- |
| `stringDateOutput` | Dates | String | The generated dates as a json string. |
| `rruleStringOutput` | RRULE String | String | The generated rrule string |
| `rruleTextOutput` | RRULE Text Output | String | ? |
| `output` | Dates | Object | ? |


