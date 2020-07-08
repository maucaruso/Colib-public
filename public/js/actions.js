window.onload = function(){ 
    // Passar Termos da busca para o botão de busca
        var searchInput = document.querySelector('.search-input.style-input');
        if (typeof(searchInput) != 'undefined' && searchInput != null){
            searchInput.addEventListener('focusout', function(){
                var getTerms = this.value;
                document.querySelector('.search-button').setAttribute('href', '/search?find='+getTerms);
            });
            searchInput.addEventListener('keyup', function(){
                if (event.keyCode === 13) {
                    var getTerms = this.value;
                    window.location.href = '/search?find='+getTerms;
                }
            });
        }

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
}