var https = require('axios');
var qs = require('querystring');

const param = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': process.env.VITE_BAIDU_API_KEY,
    'client_secret': process.env.VITE_BAIDU_SECRET_KEY
});

https.get('https://aip.baidubce.com/oauth/2.0/token', { 
    params: {
        'grant_type': 'client_credentials',
        'client_id': process.env.VITE_BAIDU_API_KEY,
        'client_secret': process.env.VITE_BAIDU_SECRET_KEY
    }
 }
).then(resp => {
    console.log(resp.data.access_token)
});