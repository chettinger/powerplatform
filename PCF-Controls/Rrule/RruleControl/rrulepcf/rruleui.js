import React, { useState, useEffect } from "react";
import {
  Radio,
  Row,
  Col,
  Input,
  InputNumber,
  Calendar,
  Checkbox,
  DatePicker
} from "antd";

import { RRule } from "rrule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

console.log(RRule.FREQUENCIES, RRule.MONTHLY, RRule.WE);

const RruleUI = () => {
  // const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  const days = [
    { label: "Mon", value: "MO" },
    { label: "Tue", value: "TU" },
    { label: "Wed", value: "WE" },
    { label: "Thu", value: "TH" },
    { label: "Fri", value: "FR" },
    { label: "Sat", value: "SA" },
    { label: "Sun", value: "SU" }
  ];
  const freqs = [
    { label: "Monthly", value: "MONTHLY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "daily", value: "DAILY" }
  ];

  const [rule, setRule] = useState({
    freq: freqs[0].value,
    interval: 1
  });

  const [occur, setOccur] = useState(new RRule());

  useEffect(() => {
    console.log("rule", rule);
    const rrule = new RRule({
      ...rule,
      freq: RRule[rule.freq],
      byweekday: rule.byweekday && rule.byweekday.map(v => RRule[v]),
      bymonthday:
        rule.bymonthday && rule.bymonthday.split(" ").map(v => parseInt(v, 10)),
      count: 10
    });

    setOccur(rrule);
    console.log("occur", rrule.all());
  }, [rule]);

  return (
    <div>
      <Row>
        <Col span={8}>
          <Radio.Group
            options={freqs}
            defaultValue={freqs[0].value}
            onChange={e => setRule({ ...rule, freq: e.target.value })}
          />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Checkbox.Group
            options={days}
            onChange={values =>
              setRule({
                ...rule,
                byweekday: values.length ? values : undefined
              })
            }
          />
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          Day in month (for last day use -1):{" "}
          <Input
            disabled={rule.freq !== freqs[0].value}
            onChange={e =>
              setRule({
                ...rule,
                bymonthday: e.target.value ? e.target.value : undefined
              })
            }
          />
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          {" "}
          <Col span={8}>
            Interval:{" "}
            <InputNumber
              min={1}
              defaultValue={1}
              onChange={value => setRule({ ...rule, interval: value })}
            />
          </Col>
        </Col>
      </Row>
      <Row>
        <Col span={4}>
          <DatePicker
            placeholder="Start date"
            onChange={d =>
              setRule({
                ...rule,
                dtstart: d
                  ? d
                      .utc()
                      .startOf("d")
                      .toDate()
                  : undefined
              })
            }
          />
        </Col>
        <Col span={8}>
          <DatePicker
            placeholder="End date"
            onChange={d =>
              setRule({
                ...rule,
                until: d
                  ? d
                      .utc()
                      .startOf("d")
                      .toDate()
                  : undefined
              })
            }
          />
        </Col>
      </Row>
      <div> {occur.toText().replace(/for.*/, "")}</div>
      <div> {occur.toString().replace(/;COUNT.*/, "")}</div>
      <ul>
        {occur.all().map((o, i) => (
          <li key={i}>{dayjs(o, { utc: true }).format("DD-MMM-YYYY dddd")}</li>
        ))}
      </ul>
      <div
        style={{
          width: 300,
          border: "1px solid #d9d9d9",
          borderRadius: 4,
          position: "absolute",
          top: 10,
          right: 10
        }}
      >
        <Calendar fullscreen={false} />
      </div>
      ,
    </div>
  );
};

export default RruleUI;
