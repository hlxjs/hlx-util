function getDateString(date) {
  return `${date.getUTCFullYear()}-${('00' + (date.getUTCMonth() + 1)).slice(-2)}-${('00' + date.getUTCDate()).slice(-2)}`;
}

function getTimeString(date) {
  return `${('00' + date.getUTCHours()).slice(-2)}:${('00' + date.getUTCMinutes()).slice(-2)}:${('00' + date.getUTCSeconds()).slice(-2)}`;
}

function getDateTimeString() {
  const date = new Date();
  return `${getDateString(date)} ${getTimeString(date)}`;
}

module.exports = {
  getDateString,
  getDateTimeString
};
