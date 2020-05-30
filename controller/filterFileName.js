// Função para remover caracteres especiais \/|?<>*:“ do nome do arquivo antes de salvar ele para não dar problemas
var filterFileName = function returnFileName(filename){
    var filteredFileName = filename.replace(/\\/g, '').replace(/\//g, '').replace(/\|/g, '').replace(/\?/g, '').replace(/</g, '').replace(/>/g, '').replace(/\*/g, '').replace(/:/g, '').replace(/"/g, '');
    return filteredFileName;
}
 
module.exports = filterFileName;