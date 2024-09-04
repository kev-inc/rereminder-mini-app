import moment from "moment";

export const parseNow = () => {
  const m = moment().utcOffset(8);
  return {
    date: m.format("YYYY-MM-DD"),
    time: m.format("HH:mm"),
    unix: m.unix(),
    mmt: m,
  };
};

export const parseUnix = (ts: number | undefined) => {
  if (ts) {
    const m = moment.unix(ts).utcOffset(8);
    return {
      date: m.format("YYYY-MM-DD"),
      time: m.format("HH:mm"),
      unix: ts,
      mmt: m,
    };
  } else {
    return {
      date: null,
      time: null,
      unix: null,
      mmt: null,
    };
  }
};

export const parseDT = (date: string, time: string) => {
  const m = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").utcOffset(8);
  return {
    date,
    time,
    unix: m.unix(),
    mmt: m,
  };
};

export const parseMmt = (mmt: moment.Moment) => {
  return {
    date: mmt.format("YYYY-MM-DD"),
    time: mmt.format("HH:mm"),
    unix: mmt.unix(),
    mmt: mmt,
  };
};
