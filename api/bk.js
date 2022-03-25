const axios = require('axios');

// e.g. https://bkimg.cdn.bcebos.com/pic/72f082025aafa40fb151174aa064034f79f01996

module.exports = async (req, res) => {
  const { img = '' } = req.query;
  const { data } = await axios.get(`https://bkimg.cdn.bcebos.com/pic/${img}`, {
    responseType: 'arraybuffer',
  });

  res.setHeader('Content-Type', 'image');
  res.status(200).send(data);
};
