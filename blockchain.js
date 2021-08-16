var Block = require('./Models/Block');
var TransactionModel = require('./Models/Transaction');
var Hashing = require('./Hashing');
var config = require('./config');
const { Hash } = require('crypto');
const verifier = require('./verifytransaction');

exports.mineBlock = (req, res, next) => {
    TransactionModel.find({}).then(block_transactions => {
        const block = new Block({
            transactions: block_transactions,
        });
        findLastBlock(lastblock => {
            if (lastblock) {
                block.index = lastblock.index + 1;
                block.prevHash = lastblock.hash
                // block.hash = Hashing(JSON.stringify(block));

            } else {
                block.index = 0;
                // block.hash = Hashing(JSON.stringify(block));
            }
            block.hash = ProofOfWork(block);
            Block.create(block).then(() => {
                TransactionModel.deleteMany({}).then(() => {
                    console.log("deleted all Existing Transactuins")
                    res.status(200).json({
                        message: 'Block added!'
                    });
                });

            }).catch(
                (error) => {
                    next(error);
                }
            );

        })
    })

}

exports.addTransaction = (transaction, isSigned, privatekey) => {
    if (!isSigned) {
        console.log("KEY", privatekey);
        let sign = verifier.getSign(JSON.stringify(transaction), privatekey);
        transaction.signature = sign;
    }
    TransactionModel.create(transaction).then(transaction=>{
        console.log("TRANSACTION ADDED");
    })
    return transaction;
}
function findLastBlock(func) {
    Block.findOne({}, null, { sort: { _id: -1 }, limit: 1 }, (err, block) => {
        if (err)
            return console.error("Cannot get last block ", err.message);
        func(block);
    });
}

let ProofOfWork = (block) => {
    var difficulty = 2
    var target = ''
    for (var i = 0; i < difficulty; i++)
        target = target + '0'
    block.nonce = 0
    var hash = Hashing(JSON.stringify(block))
    while (!hash.startsWith(target)) {
        console.log("MINING " + block.nonce);
        block.nonce += 1
        hash = Hashing(JSON.stringify(block))
    }
    return hash;
}
