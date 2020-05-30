const fs = require('fs');

function deleteFile(filePath){
    fs.unlink('public/'+filePath,(err) => { 
        if(err){
            console.error(err);
            return;
        } else {
            console.log('Arquivo antigo removido com sucesso'); 
        }
    });
}

module.exports = deleteFile;