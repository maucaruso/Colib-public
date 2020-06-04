var validateRegisterEdit = function veriryRegisterEdit(data, ProfilePic){
    var errors = [];

    // Somente dar erro caso o usuário tenha inserido algum valor na senha, não é obrigatorio
    if(data.password){
        if(!data.password || typeof data.password == undefined || data.password == null || data.password.length < 8){
            errors.push({text: 'A senha deve conter pelo menos 8 caracteres, por favor, tente novamente'});
        }
    }

    if(data.password_confirmation != data.password){
        errors.push({text: 'As senhas não são iguais, por favor, tente novamente'});
    }
    if(ProfilePic){ 
        if(!ProfilePic || typeof ProfilePic == undefined || ProfilePic == null || !ProfilePic.match(/\.(jpg|png)$/)){
            errors.push({text: 'Foto inválida, por favor, tente novamente'});
        }
    }
    return errors;
}
 
module.exports = validateRegisterEdit; 