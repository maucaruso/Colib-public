window.onload = function(){ 
    // Passar Termos da busca para o botão de busca
    document.querySelectorAll('.search-input.style-input').forEach(item => {
        var searchInput = item;
        if (typeof(searchInput) != 'undefined' && searchInput != null){
            searchInput.addEventListener('focusout', function(){
                var getTerms = this.value;
                document.querySelector('.search-button').setAttribute('href', '/search?find='+getTerms);
            });
            searchInput.addEventListener('keyup', function(e){
                if (e.keyCode === 13) {
                    var getTerms = this.value;
                    window.location.href = '/search?find='+getTerms;
                }
            });
        }
    });
    // Obter nome do arquivo library
        var checkIfLib =  document.querySelector('.form-add.library');
        if (typeof(checkIfLib) != 'undefined' && checkIfLib != null){
            document.querySelector('.form-add.library #cover').addEventListener('change', function(){
                var fileName = this.value.split('\\').pop();
                this.parentElement.dataset.fileName = fileName;
            });
            document.querySelectorAll('.form-add.library input').forEach(item => {
                item.addEventListener('change', function(){
                    var fileName = this.value.split('\\').pop();
                    this.parentElement.dataset.fileName = fileName;
                });
            });
        }

    // Passar dados do formulário para o Textarea oculto do artigo
        var checkIfPost =  document.querySelector('.form-add.article');
        if (typeof(checkIfPost) != 'undefined' && checkIfPost != null){
            document.querySelector('form button.style-button').addEventListener('click', function(){
                var getTextPost = document.querySelector('form .ql-editor').innerHTML;
                document.querySelector('form textarea').innerHTML = getTextPost;
            });

            // Obter nome da capa no artigo
                document.querySelector('.form-add.article #cover').addEventListener('change', function(){
                    var fileName = this.value.split('\\').pop();
                    this.parentElement.dataset.fileName = fileName;
                });

            // Mover conteúdo do text para dentro do bloco de edição
                var getTextArticle = document.querySelector('#content').innerHTML;
        }

    // Passar dados do formulário para o Textarea oculto do perfil
        var checkIfSettings =  document.querySelector('#middle .settings');
        if (typeof(checkIfSettings) != 'undefined' && checkIfSettings != null){
            document.querySelector('form button.style-button').addEventListener('click', function(){
                var getProfileDesc = document.querySelector('form .ql-editor').innerHTML;
                document.querySelector('form textarea').innerHTML = getProfileDesc;
            });
        }

    // Busca por ID no painel
        var adminSearch =  document.querySelector('.view-content .search-id .search-input.style-input');
        if (typeof(adminSearch) != 'undefined' && adminSearch != null){
            var getUrl = window.location.href;
            adminSearch.addEventListener('focusout', function(){
                var getTerms = this.value;
                if(getUrl.includes('/articles')){
                    document.querySelector('.search-id .search-button').setAttribute('href', '/admin/article/edit/'+getTerms);
                } else if(getUrl.includes('/library')){
                    document.querySelector('.search-id .search-button').setAttribute('href', '/admin/library/edit/'+getTerms);
                } else if(getUrl.includes('/users')){
                    document.querySelector('.search-id .search-button').setAttribute('href', '/admin/users?find='+getTerms);
                }
            });
            adminSearch.addEventListener('keyup', function(e){
                if (e.keyCode === 13) {
                    var getTerms = this.value;
                    if(getUrl.includes('/articles')){
                        window.location.href = "/admin/article/edit/"+getTerms;
                    } else if(getUrl.includes('/library')){
                        window.location.href = "/admin/library/edit/"+getTerms;
                    } else if(getUrl.includes('/users')){
                        window.location.href = "/admin/users?find="+getTerms;
                    }
                }
            });
        }
    // Requisição AJAX do botão curtir
        var checkIfArticle =  document.querySelector('form.like-form');
        if (typeof(checkIfArticle) != 'undefined' && checkIfArticle != null){
            document.querySelector('form.like-form').addEventListener('submit', function(e) {
                e.preventDefault();
                let formData = new FormData(this);
                let parsedData = {};
                for(let name of formData) {
                if (typeof(parsedData[name[0]]) == "undefined") {
                    let tempdata = formData.getAll(name[0]);
                    if (tempdata.length > 1) {
                    parsedData[name[0]] = tempdata;
                    } else {
                    parsedData[name[0]] = tempdata[0];
                    }
                }
                }
            
                let options = {};
                switch (this.method.toLowerCase()) {
                case 'post':
                    options.body = JSON.stringify(parsedData);
                case 'get':
                    options.method = this.method;
                    options.headers = {'Content-Type': 'application/json'};
                break;
                }
            
                fetch(this.action, options).then(r => r.json()).then(data => {
                    var getLikes = document.querySelector('.likes-count span').textContent;
                    var calculateLikes;
                    if(data[0] == true){
                        document.querySelector('.like-btn').classList.add("liked");
                        calculateLikes = Number(getLikes) + 1;
                        document.querySelector('.likes-count span').textContent = calculateLikes;
                    } else {
                        document.querySelector('.like-btn').classList.remove("liked");
                        calculateLikes = Number(getLikes) - 1;
                        document.querySelector('.likes-count span').textContent = calculateLikes;
                    }
                });
            });
        }
    // MENU MOBILE
    if(screen.width < 700){
        document.querySelector('.hamburger').addEventListener('click', function(){
            document.querySelector('.painel-mobile .menu').classList.add('atv');
            document.querySelector('.bg-menu').classList.add('atv');
        });
        document.querySelector('.bg-menu').addEventListener('click', function(){
            document.querySelector('.painel-mobile .menu').classList.remove('atv');
            document.querySelector('.bg-menu').classList.remove('atv');
        });
        document.querySelector('.close-btn').addEventListener('click', function(){
            document.querySelector('.painel-mobile .menu').classList.remove('atv');
            document.querySelector('.bg-menu').classList.remove('atv');
        });
    }

    // POP-UP DE CONFIRMAÇÃO DE EXCLUSÃO
        document.querySelectorAll('.page-users .fake-button.button-red').forEach(item => {
            var getUser = item;
            if (typeof(getUser) != 'undefined' && getUser != null){
                getUser.addEventListener('click', function(){
                    var getPop = this.parentElement.querySelector('.pop-remove');
                    getPop.style.display = 'block';
                    
                    getPop.querySelector('.bg-pop').addEventListener('click', function(){
                        getPop.style.display = 'none';
                    });
                    this.parentElement.querySelector('.pop-remove');
                });
            }
        });
    // POP DE APOIO LATERAL
        document.querySelectorAll('.wallets-list > .item').forEach(item => {
            var getWallet = item;
            var getPop = getWallet.querySelector('.pop-wallet');
            if (typeof(getWallet) != 'undefined' && getWallet != null){
                var getBtnOpen = getWallet.querySelector('.wallet');
                if (typeof(getBtnOpen) != 'undefined' && getBtnOpen != null){
                    getBtnOpen.addEventListener('click', function(){
                        getPop.style.display = 'block';
                    });
                }
            }
            if (typeof(getPop) != 'undefined' && getPop != null){
                getPop.querySelector('.bg-pop').addEventListener('click', function(){
                    getPop.style.display = 'none';
                    getPop.querySelector('.msg-copy').style.opacity = '0';
                });
                getPop.querySelector('.close-btn').addEventListener('click', function(){
                    getPop.style.display = 'none';
                    getPop.querySelector('.msg-copy').style.opacity = '0';
                });
                getPopBtn = getPop.querySelector('button').addEventListener('click', function(){
                    var copyWallet = getPop.querySelector('input.hidden-wallet');
                    copyWallet.focus();
                    copyWallet.select();
                    document.execCommand('copy');
                    getPop.querySelector('.msg-copy').style.opacity = '1';
                    document.activeElement.blur();
                });
            }
        });
    // Configurando leitura de artigos
        var checkIfArticle =  document.querySelector('.content.article'); 
        if (typeof(checkIfArticle) != 'undefined' && checkIfArticle != null){
            document.querySelector('.listen').addEventListener('click', () => {
                var msg = new SpeechSynthesisUtterance();
                var voices = window.speechSynthesis.getVoices();
                msg.voice = voices[10]; 
                msg.volume = 1; // From 0 to 1
                msg.rate = 1.45; // From 0.1 to 10
                msg.pitch = 1.5; // From 0 to 2
                msg.text = document.querySelector('.content-post').textContent;
                msg.lang = 'pt-br';
                if(window.speechSynthesis.paused == false && window.speechSynthesis.speaking == false){
                    window.speechSynthesis.speak(msg); 
                } else if(window.speechSynthesis.speaking == true && window.speechSynthesis.paused == false) {
                    window.speechSynthesis.pause();
                } else if(window.speechSynthesis.paused == true){
                    window.speechSynthesis.resume();
                }
            });      
            document.querySelector('.stop').addEventListener('click', () => {
                window.speechSynthesis.cancel();
            });  
            window.speechSynthesis.cancel();
            window.addEventListener("beforeunload", function(e){
                window.speechSynthesis.cancel();
            }, false);
        }
}