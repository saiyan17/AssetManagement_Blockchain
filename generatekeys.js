const { generateKeyPairSync } = require('crypto');


module.exports = KeyGenerator = () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',

    }
  });
  return { publicKey, privateKey }
}

KeyGenerator();