'use strict';

const findTrainTimes = require('./index');
const fs = require('fs');
const moment = require('moment');

test('should return a valid time from the input file', () => {
  const validTimes = fs.readFileSync('./input.txt', 'utf8').split(',');
  const res = findTrainTimes('./input.txt');

  expect(validTimes).toContain(res);
});

test('should return the next train time', () => {
  // testing for 10:45am
  const res = findTrainTimes('./input.txt', new Date().setHours(10, 45));
  expect(res).toBe('10:46');
});

test('should return first time of next day if after the last train', () => {
  // testing for 10pm
  const res = findTrainTimes('./input.txt', new Date().setHours(22));
  expect(res).toBe('7:32');
});

test('should return first time of the day if no trains have arrived yet', () => {
  // testing for 6am
  const res = findTrainTimes('./input.txt', new Date().setHours(6));
  expect(res).toBe('7:32');
});

test('should return valid time for weekdays', () => {
  const res = findTrainTimes('./days_input.txt', moment({ 'day': 1, 'hour': 5 }));
  expect(res).toBe('6:42');
});

test('should return valid time for weekends', () => {
  const saturday = moment().set({ 'day': 6, 'hour': 7, 'minute': 1 });

  const res = findTrainTimes('./days_input.txt', saturday);
  // setting before weekday only time of 7:02
  expect(res).toBe('7:12');
});

test('should return next valid time on weekend if last train missed for Friday', () => {
  const fridayNight = moment().set({ 'day': 12, 'hour': 23, 'minute': 59 });
  const res = findTrainTimes('./days_input.txt', fridayNight);
  expect(res).toBe('6:52');
});

test('should return next valid time on weekday if last train missed for Sunday', () => {
  const sundayNight = moment().set({ 'day': 7, 'hour': 23, 'minute': 59 });
  const res = findTrainTimes('./days_input.txt', sundayNight);
  expect(res).toBe('6:42');
});