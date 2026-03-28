function handleCredentialResponse(response) {
    // Aqui recebemos o Token JWT do Google
    const data = parseJwt(response.credential);
    
    // Esconde o botão e mostra os dados do usuário
    document.getElementById("buttonDiv").style.display = "none";
    document.getElementById("userProfile").style.display = "block";
    document.getElementById("userName").innerText = `Olá, ${data.given_name}`;
    document.getElementById("userPic").src = data.picture;

    console.log("Usuário logado:", data.email);
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "785159397160-0ceuv2echsf9n8ml96i5g22fndtifvsk.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", text: "signin_with" } 
    );
};

// Função para decodificar o token do Google e pegar nome/foto
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

function irParaDashboard() {
    const logado = localStorage.getItem('logado');

    if (logado === 'true') {
        window.location.href = "dashboard.html";
    } else {
        alert("Por favor, faça login com o Google primeiro!");
    }
}

function logout() {
    
    localStorage.removeItem('usuarioNome');
    localStorage.setItem('logado', 'false');
    localStorage.clear(); 
    
    google.accounts.id.disableAutoSelect();

    
    window.location.href = "index.html";
}


window.onload = function() {
    // 1. Tenta buscar os dados que o Google salvou no LocalStorage
    const nome = localStorage.getItem('usuarioNome');
    const foto = localStorage.getItem('usuarioPic');
    const logado = localStorage.getItem('logado');

    // DEBUG: Veja no F12 se esses dados aparecem no console
    console.log("Verificando login:", { nome, logado });

    const painel = document.getElementById("userProfile");

    if (logado === 'true' && nome) {
        // Preenche os campos
        document.getElementById("userName").innerText = nome;
        document.getElementById("userPic").src = foto;
        
        // MOSTRA O BOTÃO E A FOTO (Força o display flex)
        painel.style.setProperty("display", "flex", "important");
        
        // Chama sua função de carregar questões
        if (typeof buscarQuestoes === "function") {
            buscarQuestoes();
        }
    } else {
        // Se não encontrar o login, volta para a tela inicial
        console.warn("Usuário não identificado. Redirecionando...");
        window.location.href = "index.html";
    }
};

// A FUNÇÃO DE LOGOUT
function logout() {
    console.log("Limpando sessão...");
    localStorage.clear(); // Apaga tudo (nome, foto, status)
    window.location.href = "index.html"; // Volta pro início
}


    