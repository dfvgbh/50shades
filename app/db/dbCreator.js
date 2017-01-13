var faker = require('faker');

module.exports = function() {
  var data = { "users": [], "images": [] };

  for (var i = 0; i < 100; i++) {
    data.images.push({ "id": i, "url": "", "username":  faker.internet.userName() });
  }
  return data;
};