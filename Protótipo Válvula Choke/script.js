  // ================= JavaScript: o comportamento =================

  // 1) OS DADOS
  // A lista de problemas possíveis. Cada problema tem:
  //   nivel      = "aviso" (amarelo, não urgente) ou "atencao" (vermelho, urgente)
  //   sensores   = quais sensores passam a mostrar um valor ruim, e qual valor
  //   dias       = quantos dias restam (null quando é urgente)
  //   setor      = para quem o relatório seria enviado
  //   pendencias = o que precisa ser fechado ou ajustado ANTES da manutenção.
  //                Lista vazia [] = SEGURO. Lista com itens = NÃO SEGURO.
  // A posição de cada problema na lista começa em 0 (é o número usado nos botões do "Forçar problema").
  var falhas = [
    { nome: "Desgaste começando no trim", nivel: "aviso", setor: "Manutenção e Compras",
      sensores: { desvio: 7, areia: 4, vazao: 168 }, dias: 16,
      causa: "A areia está começando a desgastar a peça interna (trim). O orifício está um pouco maior que o normal.",
      acao: "Agendar inspeção na próxima parada planejada e comprar a peça de reposição.",
      pendencias: [] },

    { nome: "Vibração por cavitação", nivel: "aviso", setor: "Manutenção",
      sensores: { vibracao: 7, pressaoSaida: 500 }, dias: 30,
      causa: "A queda de pressão está alta e formam-se bolhas no fluido, que causam vibração e dano ao metal.",
      acao: "Reduzir a queda de pressão e acompanhar a vibração nos próximos dias.",
      pendencias: [] },

    { nome: "Erosão grave do trim por areia", nivel: "atencao", setor: "Manutenção, Compras, Financeiro e Segurança",
      sensores: { desvio: 22, areia: 8, vazao: 192 }, dias: null,
      causa: "O desvio do Cv passou do limite crítico. A areia comeu o orifício e a válvula pode ceder de repente.",
      acao: "Planejar a troca do trim com urgência e reduzir a queda de pressão enquanto isso.",
      pendencias: ["Fechar e travar a válvula de bloqueio (wing valve)",
                   "Despressurizar a linha pelo dreno até chegar a 0 psi",
                   "Conferir se as válvulas de desvio (bypass) estão na posição do diagrama"] },

    { nome: "Furo no corpo da válvula", nivel: "atencao", setor: "Segurança e Operação",
      sensores: { pressaoEntrada: 1800, vibracao: 6 }, dias: null,
      causa: "A pressão de entrada caiu e há vibração: o fluido pode ter furado o corpo e estar escapando.",
      acao: "Isolar a área, avisar a equipe de segurança e parar a linha.",
      pendencias: ["Parar a linha e isolar a área",
                   "Esperar a equipe de segurança liberar (risco de gás escapando)",
                   "Fechar e travar a válvula de bloqueio"] },

    { nome: "Pedido de manutenção com linha pressurizada", nivel: "atencao", setor: "Segurança e Manutenção",
      sensores: { pressaoSaida: 850 }, dias: null,
      causa: "Foi pedida a abertura da válvula, mas ainda há 850 psi de pressão residual na linha.",
      acao: "Manter fechada, abrir o dreno e esperar a pressão chegar a zero.",
      pendencias: ["Fechar e travar a válvula de bloqueio",
                   "Abrir o dreno e esperar a pressão residual (850 psi) chegar a 0"] }
  ];

  // Os valores normais de cada sensor, quando está tudo bem.
  var normais = { pressaoEntrada: 3000, pressaoSaida: 800, vazao: 158, desvio: 1, areia: 1, vibracao: 2.4 };

  // Quantas casas depois da vírgula cada sensor mostra.
  var casasDecimais = { pressaoEntrada: 0, pressaoSaida: 0, vazao: 0, desvio: 1, areia: 0, vibracao: 1 };

  // O que a faixa de estado mostra em cada situação.
  var estados = {
    desligado: { nome: "DESLIGADO", texto: "Clique em Iniciar para começar o monitoramento." },
    normal:    { nome: "NORMAL",    texto: "Nenhum problema. A válvula está funcionando bem." },
    aviso:     { nome: "AVISO",     texto: "Problema não urgente. Programe a manutenção." },
    atencao:   { nome: "ATENÇÃO",   texto: "Problema sério. Não abra a válvula e avise os setores." }
  };

  // 2) A MEMÓRIA
  // Guarda qual problema está acontecendo (null = nenhum), se o sistema está ligado e os "relógios".
  var falhaAtual = null;
  var sistemaLigado = false;
  var relogioFalha = null;
  var relogioSensores = null;

  // 3) ENCONTRAR AS PEÇAS DA PÁGINA pelo id
  var valvula = document.getElementById("valvula");
  var caixaEstado = document.getElementById("estado");
  var caixaRelatorio = document.getElementById("relatorio");
  var submenu = document.getElementById("submenu");
  var botaoIniciar = document.getElementById("botao-iniciar");
  var botaoFalha = document.getElementById("botao-falha");
  var botaoReiniciar = document.getElementById("botao-reiniciar");
  var botaoManutencao = document.getElementById("botao-manutencao");

  // 4) AS FUNÇÕES (cada uma faz uma coisa)

  // Troca a cor e o texto da faixa de estado. "tipo" pode ser: "desligado", "normal", "aviso" ou "atencao".
  function mostrarEstado(tipo) {
    caixaEstado.className = "estado " + tipo;     // o CSS pinta a faixa conforme essa classe
    document.getElementById("estado-nome").textContent = estados[tipo].nome;
    document.getElementById("estado-texto").textContent = estados[tipo].texto;
  }

  // Liga o sistema e agenda um problema aleatório para daqui a 8 a 20 segundos.
  function iniciar() {
    sistemaLigado = true;
    valvula.classList.add("ligada");        // o CSS vê essa classe e começa a animar
    botaoIniciar.disabled = true;
    botaoFalha.disabled = false;
    botaoManutencao.disabled = false;
    mostrarEstado("normal");
    var espera = 8000 + Math.random() * 12000;                // em milissegundos
    relogioFalha = setTimeout(sortearFalha, espera);          // "daqui a X ms, rode sortearFalha"
    relogioSensores = setInterval(atualizarSensores, 1000);   // "a cada 1 s, rode atualizarSensores"
    atualizarSensores();
  }

  // Abre ou fecha a sub aba do "Forçar problema".
  function abrirMenu() {
    submenu.hidden = !submenu.hidden;       // se estava escondida, mostra; se estava aberta, esconde
  }

  // Escolhe um problema qualquer da lista e dispara.
  function sortearFalha() {
    dispararFalha(Math.floor(Math.random() * falhas.length));
  }

  // Dispara o problema que está na posição "posicao" da lista: muda a faixa e cria o relatório.
  function dispararFalha(posicao) {
    if (!sistemaLigado) return;                           // sistema desligado, não faz nada
    clearTimeout(relogioFalha);                           // cancela o sorteio automático (se ainda não rodou)
    falhaAtual = falhas[posicao];

    valvula.classList.remove("aviso", "atencao");         // limpa a cor da válvula
    valvula.classList.add("ligada", falhaAtual.nivel);  // pinta a válvula (amarela ou vermelha)
    if (falhaAtual.nivel === "atencao") {
      valvula.classList.remove("ligada");                 // problema sério: a animação para
    }
    submenu.hidden = true;                                // fecha a sub aba
    mostrarEstado(falhaAtual.nivel);
    criarRelatorio(falhaAtual);
    limparManutencao();                                   // o resultado antigo da manutenção não vale mais
    atualizarSensores();
  }

  // O "relatório do sistema": pega os dados do problema e escreve o relatório na tela.
  // (O envio para o setor não está aqui: outra pessoa cuida dessa parte.)
  function criarRelatorio(falha) {
    var textoDias = "Sem previsão: agir agora.";
    if (falha.dias !== null) textoDias = "Cerca de " + falha.dias + " dias até o limite crítico.";

    document.getElementById("rel-hora").textContent = new Date().toLocaleTimeString("pt-BR");
    document.getElementById("rel-setor").textContent = falha.setor;
    document.getElementById("rel-nivel").textContent = estados[falha.nivel].nome;
    document.getElementById("rel-nome").textContent = falha.nome;
    document.getElementById("rel-causa").textContent = falha.causa;
    document.getElementById("rel-dias").textContent = textoDias;
    document.getElementById("rel-acao").textContent = falha.acao;

    caixaRelatorio.classList.remove("aviso", "atencao");
    caixaRelatorio.classList.add(falha.nivel);            // muda a cor da borda
    caixaRelatorio.hidden = false;                        // mostra o relatório
  }

  // Escreve o número de cada sensor na tela, com uma pequena variação.
  function atualizarSensores() {
    for (var nome in normais) {
      var valor = normais[nome];
      var comFalha = falhaAtual !== null && falhaAtual.sensores[nome] !== undefined;
      if (comFalha) valor = falhaAtual.sensores[nome];            // sensor do problema mostra o valor ruim
      valor = valor * (1 + (Math.random() - 0.5) * 0.04);         // varia uns 2% para cima ou para baixo
      var elemento = document.getElementById(nome);
      elemento.textContent = valor.toFixed(casasDecimais[nome]).replace(".", ",");
      elemento.parentElement.classList.toggle("ruim", comFalha);  // pinta de vermelho se for sensor do problema
    }
  }

  // Botão "Momento de manutenção": mostra SEGURO ou NÃO SEGURO na lateral.
  function verificarManutencao() {
    var pendencias = [];                                  // lista do que falta ajustar
    if (falhaAtual !== null) pendencias = falhaAtual.pendencias;
    var seguro = (pendencias.length === 0);               // sem pendências = seguro

    var lista = document.getElementById("manut-lista");
    lista.innerHTML = "";                                 // esvazia a lista
    if (seguro) {
      document.getElementById("manut-caixa").className = "manut-caixa seguro";
      document.getElementById("manut-nome").textContent = "SEGURO";
      document.getElementById("manut-texto").textContent = "Pode fazer a manutenção. Antes de abrir a válvula, espere a aprovação de um responsável.";
    } else {
      document.getElementById("manut-caixa").className = "manut-caixa naoseguro";
      document.getElementById("manut-nome").textContent = "NÃO SEGURO";
      document.getElementById("manut-texto").textContent = "Ainda não. Faça isto antes da manutenção:";
      for (var i = 0; i < pendencias.length; i++) {       // para cada item, cria uma linha <li> na lista
        lista.innerHTML += "<li>" + pendencias[i] + "</li>";
      }
    }
  }

  // Volta a caixa da manutenção para "AGUARDANDO".
  function limparManutencao() {
    document.getElementById("manut-caixa").className = "manut-caixa";
    document.getElementById("manut-nome").textContent = "AGUARDANDO";
    document.getElementById("manut-texto").textContent = "Inicie o sistema e clique no botão acima para saber se está seguro fazer a manutenção.";
    document.getElementById("manut-lista").innerHTML = "";
  }

  // Volta tudo ao começo.
  function reiniciar() {
    clearTimeout(relogioFalha);
    clearInterval(relogioSensores);
    falhaAtual = null;
    sistemaLigado = false;
    valvula.classList.remove("ligada", "aviso", "atencao");
    caixaRelatorio.hidden = true;
    submenu.hidden = true;
    botaoIniciar.disabled = false;
    botaoFalha.disabled = true;
    botaoManutencao.disabled = true;
    mostrarEstado("desligado");
    limparManutencao();
    for (var nome in normais) {
      var elemento = document.getElementById(nome);
      elemento.textContent = "--";
      elemento.parentElement.classList.remove("ruim");
    }
  }

  // 5) LIGAR CADA BOTÃO À SUA FUNÇÃO
  // "Quando clicarem neste botão, rode esta função."
  botaoIniciar.addEventListener("click", iniciar);
  botaoFalha.addEventListener("click", abrirMenu);
  botaoReiniciar.addEventListener("click", reiniciar);
  botaoManutencao.addEventListener("click", verificarManutencao);
