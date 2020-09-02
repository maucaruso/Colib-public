var validateBook = function validateBook(data, cover ,files, requiredFile){
    var errors = [];
    if(!data.name || typeof data.name == undefined || data.name == null){
        errors.push({text: 'Nome inválido'});
    }
    if(!data.author || typeof data.author == undefined || data.author == null){
        errors.push({text: 'Autor inválido'});
    }
    if(!data.description || typeof data.description == undefined || data.description == null){
        errors.push({text: 'Por favor, insira uma descrição'});
    }
    
    // Caso seja edição do livro, o envio da capa/arquivo não será obrigatório
    var errorFile = true;
    if(requiredFile == true){
        for(var key in files){
            if(files[key] != undefined){
                if(files[key].match(/\.(pdf|mobi|epub)$/)){
                    errorFile = false;
                }
            }
        }
        if(errorFile == true){
            errors.push({text: 'Arquivo inválido, por favor, tente novamente'});
        }
    } else {
        if(files.length > 0){
            for(var key in files){
                if(files[key] != undefined){
                    if(files[key].match(/\.(pdf|mobi|epub)$/)){
                        errorFile = false;
                    }
                }
            }
            if(errorFile == true){
                errors.push({text: 'Arquivo inválido, por favor, tente novamente'});
            }
        }
    }

    if(cover){ 
        if(!cover || typeof cover == undefined || cover == null || !cover.match(/\.(jpg|png)$/)){
            errors.push({text: 'Capa inválida, por favor, tente novamente'});
        }
    }

    //Tem que retornar a quantidade de erros! 
    return errors;
}

module.exports = validateBook;