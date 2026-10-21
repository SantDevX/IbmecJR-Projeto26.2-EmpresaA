// ================= JavaScript: O comportamento do sistema =================

var pecas = {
  1:  ["Corpo", "Body"],
  2:  ["Castelo", "Bonnet"],
  3:  ["Sede", "Seat"],
  4:  ["Inserto da sede", "Seat insert"],
  5:  ["Haste", "Stem"],
  6:  ["Gaiola com furos (nozzle)", "Cage"],
  7:  ["Bucha da luva externa", "External sleeve bushing"],
  8:  ["Luva externa", "External sleeve"],
  9:  ["Yoke (suporte)", "Yoke"],
  10: ["Tampa indicadora do bean", "Indicator cover"],
  11: ["Protetor da haste", "Stem protector"],
  12: ["Volante", "Handwheel"],
  13: ["Porca da haste", "Stem nut"],
  14: ["Anel de gaxeta", "Packing ring"],
  15: ["Anel de apoio", "Backing ring"],
  16: ["Preme-gaxeta", "Packing gland"],
  19: ["Vedação da haste", "Stem seal"],
  20: ["Vedação da luva externa", "External sleeve seal"],
  27: ["Vedação corpo/castelo", "Body/bonnet seal"],
  28: ["Prisioneiros", "Stud"],
  29: ["Porcas", "Nut"],
  32: ["Lubrificador (graxa)", "Lubricator"],
  33: ["Conexão de dreno", "Drain fitting"],
  34: ["Parafuso de trava da haste", "Locking screw"],
  Zentrada: ["Entrada (inlet)", ""],
  Zsaida:   ["Saída (outlet)", ""]
};

var pendIsolar = [
  "Fechar e travar a válvula de bloqueio (wing valve)",
  "Despressurizar a linha pelo dreno até chegar a 0 psi",
  "Conferir se as válvulas de desvio (bypass) estão na posição do diagrama"
];

var pendFuro = [
  "Parar a linha e isolar a área",
  "Esperar a equipe de segurança liberar (risco de gás escapando)",
  "Fechar e travar a válvula de bloqueio (wing valve)"
];

var falhas = [
  // RISCO (AMARELO)
  { nome: "Desgaste começando no trim", nivel: "risco", setor: "Manutenção e Compras",
    sensores: { desvio: 7, areia: 4, vazao: 168 }, dias: 16,
    causa: "A areia começa a desgastar a gaiola e a bucha (o trim).",
    cadeia: "A perda de integridade na gaiola (Peça 6) afeta diretamente a bucha deslizante (Peça 7) e desregula o controle de vazão.",
    dependentes: [7, 8],
    acao: "Agendar inspeção na próxima parada planejada e comprar a peça de reposição.",
    pendencias: [],
    foco: { pecas: [6, 7, 8], efeito: "areia", rotulo: "Gaiola, bucha e luva (Trim afetado em cascata)" },
    fonte: "McIlvaine slides 9 a 11." },

  { nome: "Choke cada vez mais fechada (círculo vicioso)", nivel: "risco", setor: "Operação, Manutenção e Financeiro",
    sensores: { abertura: 42, desvio: 12, vibracao: 5 }, dias: 10,
    causa: "O trim erodiu e perdeu controle, exigindo maior fechamento da luva.",
    cadeia: "O fechamento excessivo da Luva Externa (Peça 8) restringe o escoamento, forçando a Bucha (Peça 7) e elevando a vibração mecânica na Haste (Peça 5).",
    dependentes: [5, 7, 8],
    acao: "Trocar o trim em vez de continuar fechando a válvula.",
    pendencias: [],
    foco: { pecas: [5, 7, 8], efeito: "", rotulo: "Luva, bucha e haste sob esforço excessivo" },
    fonte: "McIlvaine slide 33." },

  { nome: "Vibração por cavitação", nivel: "risco", setor: "Manutenção",
    sensores: { vibracao: 7, pressaoSaida: 500 }, dias: 30,
    causa: "A queda de pressão abrupta forma bolhas que estouram logo após a restrição.",
    cadeia: "O impacto das bolhas de cavitação corrói a Gaiola (Peça 6) e transmite ondas de choque para o Corpo principal (Peça 1).",
    dependentes: [1, 6],
    acao: "Reduzir a queda de pressão e acompanhar a vibração.",
    pendencias: [],
    foco: { pecas: [1, 6, 7], efeito: "bolhas", rotulo: "Cavitação propagando do Trim para o Corpo" },
    fonte: "McIlvaine slides 20, 24 e 51." },

  { nome: "Corrosão do corpo (CO2 úmido ou H2S)", nivel: "risco", setor: "Manutenção e Compras",
    sensores: { areia: 4, desvio: 3 }, dias: 45,
    causa: "O material do corpo e do castelo sofre ataque químico por CO2 úmido ou H2S.",
    cadeia: "A corrosão estrutural do Corpo (Peça 1) compromete a fixação do Castelo (Peça 2) e enfraquece os Prisioneiros (Peças 28-29).",
    dependentes: [2, 28, 29],
    acao: "Conferir o tipo de serviço do poço e escolher material adequado.",
    pendencias: [],
    foco: { pecas: [1, 2, 28, 29], efeito: "", rotulo: "Corpo, castelo e prisioneiros corroídos" },
    fonte: "McIlvaine slides 25, 46 e 51." },

  { nome: "Entupimento dos furos da gaiola (areia e incrustação)", nivel: "risco", setor: "Operação e Manutenção",
    sensores: { vazao: 105, desvio: -28, pressaoEntrada: 3300, pressaoSaida: 600, areia: 6 }, dias: 5,
    causa: "Areia e incrustações bloqueiam os furos de passagem.",
    cadeia: "O bloqueio na Gaiola (Peça 6) impede o fluxo normal, forçando o aumento desproporcional da Pressão de Entrada e travando a Luva (Peça 8).",
    dependentes: [6, 8, "Zentrada"],
    acao: "Programar a limpeza ou troca da gaiola.",
    pendencias: [],
    foco: { pecas: [6, 8, "Zentrada"], efeito: "areia", rotulo: "Gaiola entupida bloqueando a entrada" },
    fonte: "McIlvaine slides 9, 25 e 49." },

  { nome: "Congelamento (gelo) na choke", nivel: "risco", setor: "Operação e Manutenção",
    sensores: { temperatura: -8, vazao: 95, pressaoSaida: 1100 }, dias: 2,
    causa: "A expansão rápida do gás resfria o fluido a ponto de formar gelo.",
    cadeia: "O congelamento na Saída (Zsaida) bloqueia os dutos e paralisa a operação na Sede (Peça 3) e inserto.",
    dependentes: [3, "Zsaida"],
    acao: "Reduzir a queda de pressão e aquecer a linha.",
    pendencias: [],
    foco: { pecas: [3, "Zsaida"], efeito: "", rotulo: "Formação de gelo na sede e saída" },
    fonte: "McIlvaine slides 4, 9 e 24." },

  { nome: "Engripamento (galling) da haste e da luva", nivel: "risco", setor: "Manutenção e Compras",
    sensores: { vibracao: 4, desvio: 2 }, dias: 20,
    causa: "Peças metálicas em contato direto sem proteção travam entre si.",
    cadeia: "O travamento da Haste (Peça 5) impede o acionamento do Volante (Peça 12) e imobiliza a Luva Externa (Peça 8).",
    dependentes: [5, 8, 12],
    acao: "Inspecionar a haste e usar revestimentos adequados.",
    pendencias: [],
    foco: { pecas: [5, 8, 12], efeito: "", rotulo: "Haste, luva e volante travados" },
    fonte: "McIlvaine slides 47 e 51." },

  { nome: "Carboneto de tungstênio trincado (vibração)", nivel: "risco", setor: "Manutenção e Segurança",
    sensores: { vibracao: 9, desvio: 18, areia: 3 }, dias: null,
    causa: "A vibração extrema quebrou o inserto de carboneto de tungstênio.",
    cadeia: "A quebra no material da Bucha (Peça 7) solta fragmentos que danificam imediatamente a Gaiola (Peça 6) e a Sede (Peça 3).",
    dependentes: [3, 6, 7],
    acao: "Planejar a troca do trim e reduzir a queda de pressão.",
    pendencias: pendIsolar,
    foco: { pecas: [3, 6, 7], efeito: "bolhas", rotulo: "Trim estilhaçado afetando sede e gaiola" },
    fonte: "McIlvaine slide 51." },

  // CRÍTICO (VERMELHO)
  { nome: "Erosão grave do trim por areia", nivel: "critico", setor: "Manutenção, Compras, Financeiro e Segurança",
    sensores: { desvio: 22, areia: 8, vazao: 192 }, dias: null,
    causa: "A areia corroeu profundamente os componentes internos.",
    cadeia: "O colapso da Gaiola (Peça 6) transmite fluxo descontrolado para a Sede (Peça 3) e corrói a Luva (Peça 8).",
    dependentes: [3, 6, 8],
    acao: "Planejar a troca urgente do trim e despressurizar a linha.",
    pendencias: pendIsolar,
    foco: { pecas: [3, 6, 8], efeito: "areia", rotulo: "Colapso total do trim em cadeia" },
    fonte: "McIlvaine slides 9, 11 e 33." },

  { nome: "Queda de pressão excessiva (gás expandindo)", nivel: "critico", setor: "Operação, Manutenção e Segurança",
    sensores: { pressaoEntrada: 5000, pressaoSaida: 200, vazao: 210, vibracao: 8 }, dias: null,
    causa: "A expansão violenta do gás multiplica a velocidade do fluido.",
    cadeia: "A alta velocidade afeta diretamente o Corpo (Peça 1), a Zona de Saída (Zsaida) e provoca cavitação severa na Gaiola (Peça 6).",
    dependentes: [1, 6, "Zsaida"],
    acao: "Reduzir a queda de pressão e dividir em chokes em série.",
    pendencias: pendIsolar,
    foco: { pecas: [1, 6, "Zsaida"], efeito: "bolhas", rotulo: "Corpo, gaiola e saída sob sobrecarga gasosa" },
    fonte: "McIlvaine slide 9." },

  { nome: "Erosão do corpo na saída (risco de furo)", nivel: "critico", setor: "Segurança e Operação",
    sensores: { vibracao: 6, areia: 6, vazao: 185 }, dias: null,
    causa: "O jato de areia em alta velocidade abriu cavidades na parede da saída.",
    cadeia: "O afinamento na Zona de Saída (Zsaida) compromete a estrutura mecânica do Corpo (Peça 1) e gera risco iminente de vazamento externo.",
    dependentes: [1, "Zsaida"],
    acao: "Isolar a área, avisar a segurança e interromper a linha.",
    pendencias: pendFuro,
    foco: { pecas: [1, "Zsaida"], efeito: "areia", rotulo: "Parede do corpo e saída comprometidas" },
    fonte: "McIlvaine slides 24 e 51." },

  { nome: "Vazamento nos O-rings (descompressão explosiva)", nivel: "critico", setor: "Segurança e Manutenção",
    sensores: { pressaoEntrada: 2750, vazao: 150 }, dias: null,
    causa: "Descompressão rápida rasgou os anéis de vedação sob alta pressão.",
    cadeia: "A falha nas Vedações da Luva (Peça 20) e do Corpo/Castelo (Peça 27) permite fuga de gás para o exterior do Castelo (Peça 2).",
    dependentes: [2, 20, 27],
    acao: "Isolar a área, evacuar se necessário e trocar as vedações.",
    pendencias: pendFuro,
    foco: { pecas: [2, 20, 27], efeito: "gotas", rotulo: "Vedações e castelo com vazamento em cadeia" },
    fonte: "McIlvaine slide 51." },

  { nome: "Vazamento pela haste (gaxeta e vedação)", nivel: "critico", setor: "Segurança e Manutenção",
    sensores: { pressaoEntrada: 2850 }, dias: null,
    causa: "Desgaste severo na gaxeta e anéis da haste.",
    cadeia: "A perda de vedação na Haste (Peça 5) afeta o Preme-gaxeta (Peça 16) e a Tampa Indicadora (Peça 10), expelindo fluido.",
    dependentes: [5, 10, 16],
    acao: "Isolar a área e substituir o conjunto de gaxetas.",
    pendencias: pendFuro,
    foco: { pecas: [5, 10, 16], efeito: "gotas", rotulo: "Haste, gaxeta e tampa com fuga de fluido" },
    fonte: "McIlvaine slide 51." },

  { nome: "A choke não veda na sede", nivel: "critico", setor: "Segurança, Operação e Manutenção",
    sensores: { vazao: 60, pressaoSaida: 1300, desvio: 9 }, dias: null,
    causa: "Danos na superfície de contato impedem o fechamento estanque.",
    cadeia: "A falha na Sede (Peça 3) e no Inserto (Peça 4) deixa passar fluxo residual, mantendo a Zona de Saída (Zsaida) pressurizada indevidamente.",
    dependentes: [3, 4, "Zsaida"],
    acao: "Isolar via válvula de bloqueio e trocar a sede.",
    pendencias: pendIsolar,
    foco: { pecas: [3, 4, "Zsaida"], efeito: "", rotulo: "Sede, inserto e saída sem estanqueidade" },
    fonte: "Catálogo DHV p. 5." },

  { nome: "Colapso do trim e sobrepressão depois da choke", nivel: "critico", setor: "Manutenção, Compras, Financeiro e Segurança",
    sensores: { pressaoSaida: 2400, desvio: 35, vazao: 230 }, dias: null,
    causa: "A ruptura mecânica total do trim liberou o fluxo sem restrição.",
    cadeia: "O colapso da Gaiola (Peça 6) e da Luva (Peça 8) envia onda de choque e pressão direta para a Zona de Saída (Zsaida) e tubulações jusante.",
    dependentes: [6, 8, "Zsaida"],
    acao: "Fechar o poço imediatamente e substituir o trim.",
    pendencias: pendIsolar,
    foco: { pecas: [6, 8, "Zsaida"], efeito: "areia", rotulo: "Colapso de gaiola, luva e sobrepressão na saída" },
    fonte: "Proposta ChokeGuard IA." },

  { nome: "Pedido de manutenção com linha pressurizada", nivel: "critico", setor: "Segurança e Manutenção",
    sensores: { pressaoSaida: 850 }, dias: null,
    causa: "Tentativa de abertura mecânica com pressão residual alta.",
    cadeia: "A retenção de pressão afeta a Conexão de Dreno (Peça 33) e a Zona de Saída (Zsaida), oferecendo risco grave ao operador se aberta.",
    dependentes: [33, "Zsaida"],
    acao: "Manter fechada, abrir o dreno e despressurizar.",
    pendencias: [
      "Fechar e travar a válvula de bloqueio (wing valve)",
      "Abrir o dreno e esperar a pressão residual (850 psi) chegar a 0"
    ],
    foco: { pecas: [33, "Zsaida"], efeito: "", rotulo: "Dreno e saída retendo pressão perigosa" },
    fonte: "Catálogo DHV p. 5." }
];

var normais = { pressaoEntrada: 3000, pressaoSaida: 800, vazao: 158, desvio: 1, areia: 1, vibracao: 2.4, abertura: 64, temperatura: 60 };
var casasDecimais = { pressaoEntrada: 0, pressaoSaida: 0, vazao: 0, desvio: 1, areia: 0, vibracao: 1, abertura: 0, temperatura: 0 };

var estados = {
  desligado: { nome: "DESLIGADO", text: "Clique em Iniciar para começar o monitoramento." },
  normal:    { nome: "NORMAL",    text: "Nenhum problema. A válvula está funcionando bem." },
  risco:     { nome: "RISCO",     text: "Aviso de risco no sistema. Planeje a verificação." },
  critico:   { nome: "CRÍTICO",   text: "Alerta crítico! Não abra a válvula e notifique a equipe." }
};

var falhaAtual = null;
var sistemaLigado = false;
var relogioFalha = null;
var relogioSensores = null;

var valvula = document.getElementById("valvula");
var caixaEstado = document.getElementById("estado");
var submenu = document.getElementById("submenu");
var botaoIniciar = document.getElementById("botao-iniciar");
var botaoFalha = document.getElementById("botao-falha");
var botaoReiniciar = document.getElementById("botao-reiniciar");
var botaoManutencao = document.getElementById("botao-manutencao");
var alvo = document.getElementById("alvo");
var alvoAnel = document.getElementById("alvo-anel");
var alvoLinha = document.getElementById("alvo-linha");
var alvoFundo = document.getElementById("alvo-fundo");
var alvoTexto = document.getElementById("alvo-texto");
var gotas = document.getElementById("gotas");

function montarSubmenu() {
  var criticos = [];
  var riscos = [];

  for (var i = 0; i < falhas.length; i++) {
    if (falhas[i].nivel === "critico") {
      criticos.push({ pos: i, item: falhas[i] });
    } else {
      riscos.push({ pos: i, item: falhas[i] });
    }
  }

  var html = "";
  criticos.forEach(function(o) {
    html += '<button type="button" onclick="dispararFalha(' + o.pos + ')">' + o.item.nome +
            ' <span class="tag critico">CRÍTICO</span></button>';
  });
  riscos.forEach(function(o) {
    html += '<button type="button" onclick="dispararFalha(' + o.pos + ')">' + o.item.nome +
            ' <span class="tag risco">RISCO</span></button>';
  });

  document.getElementById("submenu-lista").innerHTML = html;
}

function mostrarEstado(tipo) {
  caixaEstado.className = "estado " + tipo;
  document.getElementById("estado-nome").textContent = estados[tipo].nome;
  document.getElementById("estado-texto").textContent = estados[tipo].text;
}

function iniciar() {
  sistemaLigado = true;
  valvula.classList.add("ligada");
  botaoIniciar.disabled = true;
  botaoFalha.disabled = false;
  botaoManutencao.disabled = false;
  mostrarEstado("normal");
  var espera = 8000 + Math.random() * 12000;
  relogioFalha = setTimeout(sortearFalha, espera);
  relogioSensores = setInterval(atualizarSensores, 1000);
  atualizarSensores();
}

function abrirMenu() {
  submenu.hidden = !submenu.hidden;
}

function sortearFalha() {
  dispararFalha(Math.floor(Math.random() * falhas.length));
}

function dispararFalha(posicao) {
  if (!sistemaLigado) return;
  clearTimeout(relogioFalha);
  falhaAtual = falhas[posicao];

  valvula.classList.remove("risco", "critico");
  valvula.classList.add("ligada", falhaAtual.nivel);
  if (falhaAtual.nivel === "critico") {
    valvula.classList.remove("ligada");
  }
  submenu.hidden = true;
  mostrarEstado(falhaAtual.nivel);
  mostrarDicas(posicao);
  mostrarLocal(falhaAtual.foco);
  limparManutencao();
  atualizarSensores();
}

function mostrarLocal(foco) {
  limparLocal();
  var x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
  for (var i = 0; i < foco.pecas.length; i++) {
    var itens = valvula.querySelectorAll('[data-peca~="' + foco.pecas[i] + '"]');
    for (var j = 0; j < itens.length; j++) {
      itens[j].classList.add("destacar");
      var b = itens[j].getBBox();
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
    }
  }
  if (x1 === 1e9) return;
  if (foco.efeito) valvula.classList.add("efeito-" + foco.efeito);
  gotas.setAttribute("transform", "translate(" + ((x1 + x2) / 2) + "," + y2 + ")");

  alvo.removeAttribute("hidden");
  alvoAnel.setAttribute("x", x1 - 7); alvoAnel.setAttribute("y", y1 - 7);
  alvoAnel.setAttribute("width", x2 - x1 + 14); alvoAnel.setAttribute("height", y2 - y1 + 14);

  alvoTexto.textContent = foco.rotulo;
  var larg = alvoTexto.getComputedTextLength();
  var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, lx, ly = cy, ax, ay = cy, bx, by;
  if (x2 + 26 + larg < 556) {
    lx = x2 + 26; ax = x2 + 7; bx = lx - 6; by = ly - 4;
  } else if (x1 - 26 - larg > 4) {
    lx = x1 - 26 - larg; ax = x1 - 7; bx = lx + larg + 6; by = ly - 4;
  } else {
    lx = Math.min(x1, 552 - larg); ly = y2 + 34; ax = cx; ay = y2 + 7; bx = lx + larg / 2; by = ly - 15;
  }
  alvoTexto.setAttribute("x", lx); alvoTexto.setAttribute("y", ly);
  alvoFundo.setAttribute("x", lx - 6); alvoFundo.setAttribute("y", ly - 15);
  alvoFundo.setAttribute("width", larg + 12); alvoFundo.setAttribute("height", 24);
  alvoLinha.setAttribute("x1", ax); alvoLinha.setAttribute("y1", ay);
  alvoLinha.setAttribute("x2", bx); alvoLinha.setAttribute("y2", by);
}

function mostrarDicas(posicao) {
  document.getElementById("dicas-nome").textContent = falhas[posicao].nome;
  document.getElementById("dicas-porque").textContent = falhas[posicao].causa;
  document.getElementById("dicas-cadeia").textContent = falhas[posicao].cadeia;
  var lista = document.getElementById("dicas-causas");
  lista.innerHTML = "<li>" + falhas[posicao].acao + "</li>";
  document.getElementById("dicas").hidden = false;
}

function limparLocal() {
  var marcadas = valvula.querySelectorAll(".destacar");
  for (var i = 0; i < marcadas.length; i++) marcadas[i].classList.remove("destacar");
  valvula.classList.remove("efeito-areia", "efeito-bolhas", "efeito-gotas");
  alvo.setAttribute("hidden", "");
}

function atualizarSensores() {
  for (var nome in normais) {
    var valor = normais[nome];
    var comFalha = falhaAtual !== null && falhaAtual.sensores[nome] !== undefined;
    if (comFalha) valor = falhaAtual.sensores[nome];
    valor = valor * (1 + (Math.random() - 0.5) * 0.04);
    var elemento = document.getElementById(nome);
    elemento.textContent = valor.toFixed(casasDecimais[nome]).replace(".", ",");
    elemento.parentElement.classList.toggle("ruim", comFalha);
  }
}

function verificarManutencao() {
  var pendencias = [];
  if (falhaAtual !== null) pendencias = falhaAtual.pendencias;
  var seguro = (pendencias.length === 0);

  var lista = document.getElementById("manut-lista");
  lista.innerHTML = "";
  if (seguro) {
    document.getElementById("manut-caixa").className = "manut-caixa seguro";
    document.getElementById("manut-nome").textContent = "SEGURO";
    document.getElementById("manut-texto").textContent = "Pode fazer a manutenção. A linha está despressurizada e estabilizada.";
  } else {
    document.getElementById("manut-caixa").className = "manut-caixa naoseguro";
    document.getElementById("manut-nome").textContent = "NÃO SEGURO";
    document.getElementById("manut-texto").textContent = "Ainda não é seguro intervir. Realize as seguintes pendências:";
    for (var i = 0; i < pendencias.length; i++) {
      lista.innerHTML += "<li>" + pendencias[i] + "</li>";
    }
  }
}

function limparManutencao() {
  document.getElementById("manut-caixa").className = "manut-caixa";
  document.getElementById("manut-nome").textContent = "AGUARDANDO";
  document.getElementById("manut-texto").textContent = "Inicie o sistema e clique no botão acima para saber se está seguro fazer a manutenção.";
  document.getElementById("manut-lista").innerHTML = "";
}

function reiniciar() {
  clearTimeout(relogioFalha);
  clearInterval(relogioSensores);
  falhaAtual = null;
  sistemaLigado = false;
  valvula.classList.remove("ligada", "risco", "critico");
  limparLocal();
  document.getElementById("dicas").hidden = true;
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

botaoIniciar.addEventListener("click", iniciar);
botaoFalha.addEventListener("click", abrirMenu);
botaoReiniciar.addEventListener("click", reiniciar);
botaoManutencao.addEventListener("click", verificarManutencao);

montarSubmenu();