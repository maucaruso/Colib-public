var returnMetaDescription = function ClearDesc(content){
    if(content){
        var text = content.replace(/\<.*?\>/g, ' ');
        return text;
    }
}

module.exports = returnMetaDescription;