var faker = require('faker');

module.exports = function() {
  var data = { 'users': [], 'images': [] };

  for (var i = 0; i < 125; i++) {
    data.images.push(
    {
      'id'    : i,
      'url'   : '',
      'usr'   :  faker.internet.userName(), // username
      'date'  : faker.date.past(), // upload date
      'rate': (Math.random() * 500).toFixed(), // likes
      'tags'  : [] // tags for searching

    });
    for (var j = 0; j < Math.random() * 5; j++) {
      data.images[i].tags.push(faker.lorem.word());
    }
  }
  return data;
};