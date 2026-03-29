async function buscarQuestoes() {
    const feed = document.getElementById('feedQuestoes');
    feed.innerHTML = "<p>Carregando questões...</p>";

    try {
        const response = await fetch('questoes.json');
        const todasAsQuestoes = await response.json();

        iniciarCronometro();

        // PEGA O FILTRO SELECIONADO NO HTML
        const filtroDisciplina = document.getElementById('disciplina').value;
        const filtroBanca = document.getElementById('banca').value.toLowerCase();

        // LOGICA DO FILTRO
        const filtradas = todasAsQuestoes.filter(q => {
            const bateDisciplina = filtroDisciplina === "todos" || q.disciplina === filtroDisciplina;
            const bateBanca = q.banca.toLowerCase().includes(filtroBanca);
            return bateDisciplina && bateBanca;
        });

        exibirNaTela(filtradas);

    } catch (error) {
        console.error("Erro:", error);
        feed.innerHTML = "<p>Erro ao carregar o arquivo JSON.</p>";
    }
}

function exibirNaTela(lista) {
    const feed = document.getElementById('feedQuestoes');
    
    if (lista.length === 0) {
        feed.innerHTML = "<p>Nenhuma questão encontrada para este filtro.</p>";
        return;
    }

    // MAP PARA GERAR O HTML
    feed.innerHTML = lista.map((q, index) => {
        // 'index + 1' serve para enumerar as questões
        const numeroQuestao = index + 1;

        return `
            <div class="card-questao" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px; background: #fff;">
                <span style="color: #666; font-size: 12px;">Questão ${numeroQuestao} | ${q.banca} | ${q.ano}</span>
                <p style="font-weight: bold; margin-top: 10px;">${q.enunciado}</p>
                
                <div class="alternativas" style="display: flex; flex-direction: column; gap: 8px;">
                    ${q.alternativas.map((alt, i) => {
                        // TRUQUE DE ADS: 65 é o código ASCII da letra 'A'
                        const letra = String.fromCharCode(65 + i); 
                        return `
                            <label style="cursor: pointer; padding: 5px; border-radius: 4px; background: #f9f9f9;">
                                <input type="radio" name="pergunta-${q.id}" value="${i}">
                                <strong>${letra})</strong> ${alt}
                            </label>
                        `;
                    }).join('')}
                </div>

                <button class="btn-verificar" onclick="verificarResposta(${q.id}, ${q.correta})" style="margin-top: 15px; cursor: pointer; color: white; background-color: #2c3e50; border-radius: 9px;">
                    Verificar Resposta
                </button>
                <div id="feedback-${q.id}" style="margin-top: 10px; font-weight: bold;"></div>
            </div>
        `;
    }).join('');
}

// VARIÁVEIS GLOBAIS (ADS: Escopo global para persistir durante a sessão)
let totalAcertos = 0;
let totalErros = 0;
let questoesRespondidasIds = new Set(); // Para não contar a mesma questão duas vezes

function verificarResposta(id, indexCorreto) {
    // 1. Verifica se o usuário já respondeu esta questão nesta sessão
    if (questoesRespondidasIds.has(id)) {
        alert("Você já respondeu esta questão!");
        return;
    }

    const selecionada = document.querySelector(`input[name="pergunta-${id}"]:checked`);
    const feedback = document.getElementById(`feedback-${id}`);

    if (!selecionada) {
        feedback.innerHTML = "⚠️ Selecione uma opção!";
        feedback.style.color = "orange";
        return;
    }

    const valorEscolhido = parseInt(selecionada.value);

    // 2. Lógica de Contagem
    if (valorEscolhido === indexCorreto) {
        totalAcertos++;
        feedback.innerHTML = "✅ ACERTOU!";
        feedback.style.color = "green";
    } else {
        totalErros++;
        const letraCorreta = String.fromCharCode(65 + indexCorreto);
        feedback.innerHTML = `❌ ERROU! A correta era a <strong>${letraCorreta}</strong>`;
        feedback.style.color = "red";
    }

    const totalQuestoesNaTela = document.querySelectorAll('.card-questao').length;
    
    if (questoesRespondidasIds.size === totalQuestoesNaTela) {
        pararCronometro();
        exibirRelatorioFinal();
    }

    // 3. Marca como respondida e atualiza o placar
    questoesRespondidasIds.add(id);
    atualizarPlacarVisual();
    
    // Desativa os inputs para o usuário não mudar a resposta
    document.querySelectorAll(`input[name="pergunta-${id}"]`).forEach(input => input.disabled = true);
}

function atualizarPlacarVisual() {
    const total = totalAcertos + totalErros;
    const porcentagem = total > 0 ? ((totalAcertos / total) * 100).toFixed(1) : 0;

    // Atualiza apenas os textos e números
    const elAcertos = document.getElementById('contador-acertos');
    const elErros = document.getElementById('contador-erros');
    const elPorcentagem = document.getElementById('porcentagem-acerto');

    if (elAcertos) elAcertos.innerText = totalAcertos;
    if (elErros) elErros.innerText = totalErros;
    if (elPorcentagem) elPorcentagem.innerText = `${porcentagem}%`;
}

function reiniciarSimulado() {
    // 1. Pergunta se o usuário tem certeza (Boa prática de UX)
    if (!confirm("Deseja zerar seu progresso e recomeçar o simulado?")) {
        return;
    }

    // 2. Reseta as variáveis globais na memória
    totalAcertos = 0;
    totalErros = 0;
    questoesRespondidasIds.clear(); // Limpa o Set de IDs

    iniciarCronometro();

    // 3. Atualiza o placar visual para zero
    atualizarPlacarVisual();

    // 4. Recarrega as questões (isso limpa os rádios selecionados e cores de erro/acerto)
    buscarQuestoes();

    console.log("Simulado reiniciado com sucesso!");
}

let segundosDecorridos = 0;
let intervaloCronometro = null;

function iniciarCronometro() {
    // Se já houver um cronômetro rodando, a gente limpa ele antes de começar outro
    if (intervaloCronometro) clearInterval(intervaloCronometro);
    
    segundosDecorridos = 0; // Reseta o tempo
    
    intervaloCronometro = setInterval(() => {
        segundosDecorridos++;
        atualizarRelogioVisual();
    }, 1000); // Roda a cada 1 segundo (1000ms)
}

function atualizarRelogioVisual() {
    const horas = Math.floor(segundosDecorridos / 3600);
    const minutos = Math.floor((segundosDecorridos % 3600) / 60);
    const segundos = segundosDecorridos % 60;

    // Formatação com "padStart" para sempre ter dois dígitos (ex: 05 em vez de 5)
    const h = horas.toString().padStart(2, '0');
    const m = minutos.toString().padStart(2, '0');
    const s = segundos.toString().padStart(2, '0');

    document.getElementById('tempo-prova').innerText = `${h}:${m}:${s}`;
}

function pararCronometro() {
    clearInterval(intervaloCronometro);
}

function exibirRelatorioFinal() {
    const tempoTotal = document.getElementById('tempo-prova').innerText;
    const acertos = totalAcertos;
    const erros = totalErros;
    const total = acertos + erros;
    const aproveitamento = ((acertos / total) * 100).toFixed(1);

    // Criando uma mensagem de feedback baseada na performance
    let mensagemFeedback = "";
    if (aproveitamento >= 80) {
        mensagemFeedback = "🔥 Excelente! Você está no caminho certo para a aprovação.";
    } else if (aproveitamento >= 50) {
        mensagemFeedback = "👍 Bom desempenho! Continue revisando os pontos fracos.";
    } else {
        mensagemFeedback = "📚 Precisa de mais estudo. Não desista, a constância é a chave!";
    }

    // Mostrando o resultado de forma elegante (pode ser um modal ou um alerta)
    alert(`
        🏆 SIMULADO CONCLUÍDO! 🏆
        
        ⏱️ Tempo Total: ${tempoTotal}
        ✅ Acertos: ${acertos}
        ❌ Erros: ${erros}
        📊 Aproveitamento: ${aproveitamento}%
        
        ${mensagemFeedback}
    `);
}