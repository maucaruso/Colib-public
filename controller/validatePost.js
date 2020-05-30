var validatePost = function validatePost(data, cover, requiredFile){
    var errors = [];
    if(!data.title || typeof data.title == undefined || data.title == null){
        errors.push({text: 'Nome inválido'});
    }

    var ClearHtml = data.content.replace(/\<.*?\>/g, ' ');
    if(!data.content || typeof data.content == undefined || data.content == null || ClearHtml.length < 200){
        errors.push({text: 'Texto muito curto, por favor, tente novamente'});
    }
    if(cover){ 
        if(!cover || typeof cover == undefined || cover == null || !cover.match(/\.(jpg|png)$/)){
            errors.push({text: 'Capa inválida, por favor, tente novamente'});
        }
    }
    //Tem que retornar a quantidade de erros! 
    return errors;
}
 
module.exports = validatePost; 