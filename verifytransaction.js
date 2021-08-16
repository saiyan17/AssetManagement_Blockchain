const crypto = require('crypto');

exports.getSign = (input, privateKey) => {
	const signature = crypto.sign("sha256", Buffer.from(input), {
		key: privateKey,
		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	})
	console.log(typeof signature);
	console.log(signature);
	return signature;
}
function func(input, privateKey) {
	const signature = crypto.sign("sha256", Buffer.from(input), {
		key: privateKey,
		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	})
	console.log("SIGNNING _------------")
	console.log(typeof signature);
	console.log(signature);
	return signature;
}
exports.verify = (transaction, publicKey) => {

	let signature = Buffer.from(transaction.signature);
	console.log(signature);
	delete transaction.signature;
	const isVerified = crypto.verify(
		"sha256",
		Buffer.from(JSON.stringify(transaction)),
		{
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
		},
		signature
	)

	console.log("signature verified: ", isVerified)
	return isVerified;
}