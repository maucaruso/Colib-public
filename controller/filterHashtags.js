var filterHashtag = function validateFiles(Hashtags){
    if(Hashtags != null && Hashtags != undefined && Hashtags != ''){
        var arrayHashtags = [];
        var splitHashtags = Hashtags.replace(/ /g, '').replace(/,/g, '').split('#');
        // Limpando array de valores repeditos
            var filterArray = splitHashtags.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
        for(var key in filterArray){
            if(splitHashtags[key] != '' && splitHashtags[key] != undefined && splitHashtags[key] != null){
                arrayHashtags.push('#'+splitHashtags[key]);
            }
        }
        return arrayHashtags; 
    }
}
 
module.exports = filterHashtag;