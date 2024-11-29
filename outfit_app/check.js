const axios = require('axios');
const FileType = require('file-type');

(async () => {
    const response = await axios.get('https://i.imghippo.com/files/Gey4063zM.85b5177387afa1e1b15f1265283d0d4f', { responseType: 'arraybuffer' });
    const type = await FileType.fromBuffer(response.data);
    console.log(type); // Outputs something like { ext: 'jpg', mime: 'image/jpeg' }
})();
