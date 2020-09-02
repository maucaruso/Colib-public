var returnFile = function validateFiles(files, fileSearch, filePath){
    for(var key in files){
        var fileName = files[key].originalname;

        if(!filePath){
            if(fileName.match(/\.(pdf)$/) && fileSearch == 'pdf'){
                return '/uploads/files/'+files[key].filename;
            }else if(fileName.match(/\.(epub)$/) && fileSearch == 'epub'){
                return '/uploads/files/'+files[key].filename;
            }else if(fileName.match(/\.(mobi)$/) && fileSearch == 'mobi'){
                return '/uploads/files/'+files[key].filename;
            }else if(fileName.match(/\.(jpg|png)$/) && fileSearch == 'img'){
                return '/uploads/images/'+files[key].filename;
            }
        } else {
            if(fileName.match(/\.(jpg|png)$/) && fileSearch == 'img'){
                return '/uploads/images/'+filePath+'/'+files[key].filename;
            }
        }
    }
}

module.exports = returnFile;