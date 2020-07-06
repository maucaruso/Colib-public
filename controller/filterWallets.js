var filterWallets = function createObject(crypto_name, crypto_address){
    if(crypto_name.length > 0 && crypto_address.length > 0){
        var objWallets = [];
        for(var key in crypto_name){
            var cryptoName = crypto_name[key];
            var cryptoAddress = crypto_address[key];
            objWallets.push({cryptoName: cryptoName, cryptoAddress: cryptoAddress});
        }
        return objWallets; 
    }
}
 
module.exports = filterWallets;