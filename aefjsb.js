const crypto = require('crypto');
const generatekeys = require('./generatekeys');

const getSign = (transaction, privateKey) => {
    const signature = crypto.sign("sha256", Buffer.from(transaction), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    })
    return signature;
}
const verify = (transaction, publicKey, sign) => {

    let signature = sign;
    const isVerified = crypto.verify(
        "sha256",
        Buffer.from(transaction),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
    )
    console.log("signature verified: ", isVerified)
    return isVerified;
}
const { publicKey, privateKey } = generatekeys();
var msg = "fsdnjsldbf";
var sign = getSign(msg, privateKey).toJSON();
console.log(sign);
console.log(typeof sign)
if (verify(msg, publicKey, sign))
    console.log("HI");