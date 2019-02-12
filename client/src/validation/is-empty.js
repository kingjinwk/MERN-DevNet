const isEmpty = value =>
  value === undefined ||
  value === null ||
  (value.constructor === Object && Object.entries(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);

export default isEmpty;
