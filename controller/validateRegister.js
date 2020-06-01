var validateRegister = function veriryRegister(data){
    var errors = [];

    // if(!data.register_name || typeof data.register_name == undefined || data.register_name == null || data.register_name.length < 3){
    //     errors.push({text: 'Nome muito curto, por favor, tente novamente'});
    // }
    if(!data.register_nickname || typeof data.register_nickname == undefined || data.register_nickname == null || data.register_nickname.length < 3){
        errors.push({text: 'Apelido muito curto, por favor, tente novamente'});
    }

    // Validando formato do e-mail
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    var validEmail = validateEmail(data.register_email);
    if(!validEmail){
        errors.push({text: 'E-mail inválido, por favor, tente novamente'});
    }

    if(!data.register_password || typeof data.register_password == undefined || data.register_password == null || data.register_password.length < 8){
        errors.push({text: 'A senha deve conter pelo menos 8 caracteres, por favor, tente novamente'});
    }
    if(data.register_password_confirmation != data.register_password){
        errors.push({text: 'As senhas não são iguais, por favor, tente novamente'});
    }
    //Tem que retornar a quantidade de erros! 
    console.log(errors);
    return errors;
}

module.exports = validateRegister; 