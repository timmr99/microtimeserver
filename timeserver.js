/*jshint esversion: 6 */

// good date
// { "unix": 1450137600, "natural": "December 15, 2015" }
// bad date
// { "unix": null, "natural": null }

// TODO: 

function month2LongName(mo) {
  var cvt = {
    0: 'January',
    1: 'Feburary',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  };
  return cvt[mo];
}

function month2ShortName(mo) {
  var cvt = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
  };
  return cvt[mo];
}

function textMonth2Number(month) {
  var cvt = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  };
  return cvt[month];
}

function validate(day, mo, yr) {
  // Check the ranges of month and year
  if (yr < 1970 || yr > 2036 || mo < 0 || mo > 11) {
    return false;
  }

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (yr % 400 == 0 || (yr % 100 != 0 && yr % 4 == 0)) {
    monthLength[1] = 29;
  }

  // Check the range of the day
  return day > 0 && day <= monthLength[mo - 1];
}

function conversion(day, mo, yr) {
  var data;
  var date;
  var epoch;
  var dt;
  var mn;
  var now;

  if (day === null && yr === null) {
    // got epoch seconds using 2036/01/01 as last date of epoch for 
    // new Date(mo*1000) === 1970/01/01 -> bad epoch
    dt = new Date(mo * 1000);
    if (dt.getTime() > 2082783600000 || dt.getTime() < 25200000) {
      data = {
        unix: null,
        natural: null
      };
    } else {
      date = month2LongName(dt.getMonth(mo)) + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      epoch = dt.getTime() / 1000;
      data = {
        unix: epoch,
        natural: date
      };
    }
  } else {

    if (mo !== null) {
      mn = textMonth2Number(mo.toLowerCase());
    } else if (mo === null) {
      now = new Date();
      mn = now.getMonth();
      mo = month2ShortName(mn);
    }
    if (day === null) {
      day = 1;
    }
    if (yr === null) {
      now = new Date();
      yr = now.getFullYear();
    }

    if (validate(day, mn, yr)) {
      dt = new Date(yr, mn, day);
      date = month2LongName(dt.getMonth()) + ' ' + day + ', ' + dt.getFullYear();
      epoch = dt.getTime() / 1000;
      data = {
        unix: epoch,
        natural: date
      };
    } else {
      data = {
        unix: null,
        natural: null
      };
    }
  }
  return data;
}

module.exports = {

  date_processor: function(input) {

    var url = decodeURI(input.toLowerCase());

    // (1) day and month, smushed
    var dmsRE = new RegExp(/^(\d{1,2})([a-z]{3,12})$/);
    // (2) day month year, smushed
    var dmyRE = new RegExp(/^(\d{1,2})([a-z]{3,12})(\d{2,4})$/);
    // (3) Day and textual month
    var dayTxtMonRE = new RegExp(/^\b(\d{1,2})\b(?: |\.|-)+\b([a-z]{3,12})\b$/);
    // (4) Day textual month and year
    var dayTxtMonYearRE = new RegExp(/^\b(\d{1,2})\b(?:\.|\t|-| )*\b([a-z]{3,12})\b(?:\.|\t|-| )*(\d{2,4})\b$/);
    // (5) Eight digit year, month and day
    var digitYrMoDayRE = new RegExp(/^\b(\d{4})(\d{2})(\d{2})\b$/);
    // (6) 1502118708 - Mon Aug 7 09:11:43 DST 2017
    var digitsRE = new RegExp(/^(\d{10,})$/);
    // (7) 02 02 2020
    var monthFirstRE = new RegExp(/^\b(\d{1,2})\b(?:-|_|:|\/| )*\b(\d{1,2})\b(?:-|_|:|\/| )*\b(\d{2,4})\b$/);
    // (8) Jan(uary) 2, 2020
    var namedMonthRE = new RegExp(/^\b([a-z]{3,12})\b(?:-|_|:|\/| )*\b(\d{1,2})\b(?:-|_|:|\/| |,)*\b(\d{2,4})\b$/);
    // (9) Textual month and day - Jan 1st (also picks up just month, not good)
    var txtMonDayRE = new RegExp(/^\b([a-z]{3,12})\b(?: |\.|-)+\b(\d{1,2})(?:[dnrst]{0,2})\b$/);
    // (10) Textual month and four digit year
    var txtMonYearRE = new RegExp(/^\b([a-z]{3,12})\b(?: |\t|-)+(\d{2,4})$/);
    // (11) Textual month (and just the month)
    var txtMonthRE = new RegExp(/^\b([a-z]{3,12})\b$$/);
    // (12) American month and year
    var usMonthYearRE = new RegExp(/^\b(\d{1,2})\b(?:\/|-| )+\b(\d{2,4})\b$/);
    // (13) 2020 2 2
    var yearFirstRE = new RegExp(/^\b((?:19|20)\d{2})\b(?:-|_|:|\/| |\t|\.)*\b(\d{1,2})\b(?:-|_|:|\/| |\t|\.)*(\d{1,2})$/);
    // (14) Four digit year and month (GNU)
    var yearMonthRE = new RegExp(/^\b(\d{4}\b(?:\/|-| )+\b(\d{2}))$/);
    // (15) Year (and just the year)
    var yearRE = new RegExp(/^\b(\d{4}\b)$/);
    // (16) Four digit year and textual month 
    var yrTxtMonthRE = new RegExp(/^\b(\d{2,4})\b(?:-|\.| |\t)+\b([a-z]{3,12})\b$/);

    var dmsRe = dmsRE.exec(url);
    var dmyRe = dmyRE.exec(url);
    var dtmRe = dayTxtMonRE.exec(url);
    var dtmyRe = dayTxtMonYearRE.exec(url);
    var dymdRe = digitYrMoDayRE.exec(url);
    var epochRe = digitsRE.exec(url);
    var mfRe = monthFirstRE.exec(url);
    var nmRe = namedMonthRE.exec(url);
    var tmRe = txtMonthRE.exec(url);
    var tmdRe = txtMonDayRE.exec(url);
    var tmyRe = txtMonYearRE.exec(url);
    var umdRe = usMonthYearRE.exec(url);
    var yfRe = yearFirstRE.exec(url);
    var ymRe = yearMonthRE.exec(url);
    var yrRe = yearRE.exec(url);
    var ytmRe = yrTxtMonthRE.exec(url);

    var data;
    if (dmsRe != null) {
      data = conversion(parseInt(dmsRe[1]), dmsRe[2].slice(0, 3), null);
    } else if (dmyRe != null) {
      data = conversion(parseInt(dmyRe[1]), dmyRe[2].slice(0, 3), parseInt(dmyRe[3]));
    } else if (dtmRe != null) {
      data = conversion(parseInt(dtmRe[1]), dtmRe[2].slice(0, 3), null);
    } else if (dtmyRe != null) {
      data = conversion(parseInt(dtmyRe[1]), dtmyRe[2].slice(0, 3), parseInt(dtmyRe[3]));
    } else if (dymdRe != null) {
      data = conversion(parseInt(dymdRe[3]), month2ShortName(parseInt(dymdRe[2]) - 1), parseInt(dymdRe[1]));
    } else if (epochRe != null) {
      data = conversion(null, parseInt(epochRe[1]), null);
    } else if (mfRe != null) {
      data = conversion(parseInt(mfRe[2]), month2ShortName(parseInt(mfRe[1]) - 1), parseInt(mfRe[3]));
    } else if (nmRe != null) {
      data = conversion(parseInt(nmRe[2]), nmRe[1].slice(0, 3), parseInt(nmRe[3]));
    } else if (tmRe != null) {
      if (tmRe[2] !== undefined) {
        data = conversion(parseInt(tmRe[1]), tmRe[2].slice(0, 3), null);
      } else {
        data = {
          unix: null,
          natural: null
        };
      }
    } else if (tmdRe != null) {
      data = conversion(parseInt(tmdRe[2]), tmdRe[1].slice(0, 3), null);
    } else if (tmyRe != null) {
      data = conversion(null, tmyRe[1].slice(0, 3), parseInt(tmyRe[2]));
    } else if (umdRe != null) {
      data = conversion(null, month2ShortName(parseInt(umdRe[1]) - 1), parseInt(umdRe[2]));
    } else if (yfRe != null) {
      data = conversion(parseInt(yfRe[3]), month2ShortName(parseInt(yfRe[2]) - 1), parseInt(yfRe[1]));
    } else if (ymRe != null) {
      data = conversion(null, month2ShortName(parseInt(ymRe[2]) - 1), parseInt(ymRe[1]));
    } else if (yrRe != null) {
      data = conversion(null, null, parseInt(yrRe[1]));
    } else if (ytmRe != null) {
      data = conversion(null, ytmRe[2].slice(0, 3), parseInt(ytmRe[1]));
    } else {
      data = {
        unix: null,
        natural: null
      };
    }

    return data;
  }

};
/*
  if (process.argv.length > 2) {
  console.log(date_processor(process.argv[2]));
} else {
  console.log(date_processor("20170708"));
  console.log(date_processor("July-08-2017"));
  console.log(date_processor("Jul 08 2017"));
  console.log(date_processor("08 Jul 2017"));
  console.log(date_processor("07/2017"));
  console.log(date_processor("07/08/2017"));
  console.log(date_processor("2017/07/08"));
  console.log(date_processor("2017-07"));
  console.log(date_processor("7-8-2017"));
  console.log(date_processor("July 2017"));
  console.log(date_processor("Jul 8"));
  console.log(date_processor("May-8-2017"));
  console.log(date_processor("2017"));
  console.log(date_processor("July"));
  console.log(date_processor("08July"));
  console.log(date_processor("07July2017"));
  console.log(date_processor("10-July"));
  console.log(date_processor("1502118708"));
  console.log(date_processor("2017-July"));
  console.log(date_processor("2040-September"));
  console.log(date_processor("1940-September"));
}

*/
