'use strict';

const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thu', 'Fri'];

class TrainScheduler {
  constructor(input, now) {
    this.trainTimes = _(input)
      .split(',')
      .map((inputTime) => {
        const isWeekdayOnly = inputTime.endsWith('*');
        inputTime = inputTime.replace('*', '');
        const [hours, minutes] = inputTime.split(':').map(Number);
        const unixTime = moment(now).hour(hours).minute(minutes).valueOf();

        return { inputTime, unixTime, isWeekdayOnly };
      })
      .sortBy(input, 'unixTime')
      .value();

    this.weekendOnlyTimes = _.filter(this.trainTimes, (o) => !o.isWeekdayOnly)
  }

  static compareTimes(now, times) {
    let res;
    _.forEach(times, ({ inputTime, unixTime, isWeekdayOnly }, i) => {
      // if now if greater than the current index's time and less than the next
      // set the next time to the upcoming one
      if (i === 0 && now < unixTime) {
        res = inputTime;
      } else if (
        now > unixTime &&
        now < _.get(times[i + 1], 'unixTime')
      ) {
        res = times[i + 1].inputTime;
      }
    });

    return res;
  }

  nextTime(now) {
    // parse the input into an object with the time and the unix time for comparison
    // then sort them to be in order
    let next;
    const today = moment(now).format('ddd');
    if (daysOfWeek.includes(today)) {
      next = TrainScheduler.compareTimes(now, this.trainTimes);
    } else {
      next = TrainScheduler.compareTimes(now, this.weekendOnlyTimes);
    }

    // if we were unable to find a next, use the first time of the next day
    if (!next) {
      const tomorrow = moment(now).add(1, 'd').startOf('d');

      if (daysOfWeek.includes(tomorrow.format('ddd'))) {
        next = this.trainTimes[0].inputTime;
      } else {
        next = !this.weekendOnlyTimes.length
          ? this.trainTimes[0].inputTime
          : this.weekendOnlyTimes[0].inputTime;
      }

    }

    return next;
  }
}

// setting a default time to be able to pass arbitrary times for testing
const findTrainTimes = (path, currentTime = moment()) => {
  // load the file
  const input = fs.readFileSync(path, 'utf8');

  // instantiate a scheduler with the input string
  const scheduler = new TrainScheduler(input, currentTime);

  // set the time to now 
  const now = moment(currentTime).valueOf();

  return scheduler.nextTime(now);
};

module.exports = findTrainTimes;

// console.log(findTrainTimes(process.argv[2]));