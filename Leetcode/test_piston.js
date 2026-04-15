const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: 'javascript',
            version: '18.15.0',
            files: [{ content: 'console.log("hello");' }]
        });
        console.log(res.data);
    } catch(e) {
        console.error(e.response?.status, e.response?.data);
    }
}
test();
