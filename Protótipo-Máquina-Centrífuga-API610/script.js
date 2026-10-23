// ================= JavaScript: o comportamento =================

  // 1) OS DADOS
  // Uma lista com os 5 sensores, com os números da tabela:
  //   media            = valor típico quando tudo vai bem
  //   normalMin/Max    = faixa normal (verde)
  //   criticoMenorQue  = abaixo disso é crítico (vermelho)
  //   criticoMaiorQue  = acima disso é crítico (vermelho)
  //   alvoAlerta/Critico = valor para onde o sensor caminha quando simulamos um problema
  //   casas            = quantas casas decimais mostrar
  // Se mudar uma faixa, mude também o texto dela no HTML.
  var sensores = [
    { id: "vazao",       media: 120, casas: 0, normalMin: 108, normalMax: 132, criticoMenorQue: 90,  criticoMaiorQue: 150, alvoAlerta: 100,  alvoCritico: 80  },
    { id: "pressao",     media: 50,  casas: 1, normalMin: 46,  normalMax: 55,  criticoMenorQue: 40,  criticoMaiorQue: 60,  alvoAlerta: 43,   alvoCritico: 35  },
    { id: "temperatura", media: 80,  casas: 1, normalMin: 70,  normalMax: 90,  criticoMenorQue: 60,  criticoMaiorQue: 100, alvoAlerta: 94,   alvoCritico: 105 },
    { id: "vibracao",    media: 3,   casas: 2, normalMin: 0.5, normalMax: 4.5, criticoMenorQue: 0,   criticoMaiorQue: 7,   alvoAlerta: 5.7,  alvoCritico: 7.8 },
    { id: "consumo",     media: 3.5, casas: 2, normalMin: 3.1, normalMax: 3.9, criticoMenorQue: 2.8, criticoMaiorQue: 4.4, alvoAlerta: 4.15, alvoCritico: 4.7 }
  ];

  // Os textos do card de status (os 3 da imagem, mais o NORMAL para quando tudo vai bem).
  var mensagens = {
    desligado: { titulo: "DESLIGADO", texto: "Clique em Iniciar para começar o monitoramento." },
    normal:    { titulo: "NORMAL",    texto: "Tudo certo. Todos os sensores estão dentro da faixa normal." },
    alerta:    { titulo: "ALERTA",    texto: "Problema não urgente. Programe a manutenção." },
    critico:   { titulo: "CRÍTICO",   texto: "Problema sério. Não abra a válvula e avise os setores." }
  };

  // O nome de cada status, como aparece na etiqueta do sensor.
  var nomesStatus = { normal: "Normal", alerta: "Alerta", critico: "Crítico" };

  // 2) A MEMÓRIA
  var ligado = false;          // a bomba está ligada?
  var relogioProblema = null;  // o "relógio" que vai sortear o problema
  var relogioSensores = null;  // o "relógio" que atualiza os números a cada segundo

  // ================= NOVO (Julia): envio do alerta para o n8n pelo MQTT =================
  // Tudo que está entre esta linha e "FIM DO MQTT" foi adicionado. O resto do arquivo continua igual
  // (só 3 linhas marcadas com "NOVO (Julia)" lá embaixo, nas funções provocarProblema, atualizar e reiniciar).

  // a) Onde fica o broker (o "carteiro") e em qual tópico (o "grupo") este protótipo publica
  var BROKER = "wss://broker.hivemq.com:8884/mqtt";
  var TOPICO = "inspectai-ibmecjr/compressor/BOMBA-API610";
  var MAQUINA = "Bomba Centrífuga API 610";
  var clienteMQTT = null;

  // b) Informações de cada sensor que o n8n precisa (os textos são os mesmos dos cartões do HTML)
  var infoSensores = {
    vazao:       { nome: "Vazão do Petróleo",   un: "m³/h",   setor: "Operações de Produção",      componente: "Rotor / Impelidor: erosão das pás internas ou cavitação na linha de sucção." },
    pressao:     { nome: "Pressão de Operação", un: "bar",    setor: "Engenharia de Processos",    componente: "Selo Mecânico / Válvulas: perda de contenção primária nas faces de vedação." },
    temperatura: { nome: "Temperatura",         un: "°C",     setor: "Manutenção de Equipamentos", componente: "Mancal e Ventilação: degradação do filme lubrificante e atrito metálico severo." },
    vibracao:    { nome: "Vibração Mecânica",   un: "mm/s",   setor: "Manutenção Mecânica",        componente: "Rolamento Radial e Eixo: folga mecânica, desalinhamento ou fissura na pista." },
    consumo:     { nome: "Consumo Elétrico",    un: "kWh/m³", setor: "Utilidades e Eficiência",    componente: "Motor Elétrico: aumento de corrente exigido para vencer resistência mecânica." }
  };

  // c) Mostra no canto da tela se o MQTT está conectado e se o alerta foi enviado
  // NOVO (Julia): as caixinhas do MQTT e do ML ficam numa barra logo abaixo do card de status
  // (antes ficavam "flutuando" no canto e cobriam os cartões dos sensores)
  function caixaNaBarra(id, corBorda) {
    var caixa = document.getElementById(id);
    if (caixa) return caixa;
    var barra = document.getElementById("barra-backend");
    if (!barra) {
      barra = document.createElement("div");
      barra.id = "barra-backend";
      barra.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin:12px 0;";
      var card = document.getElementById("card-status");
      if (card) card.insertAdjacentElement("afterend", barra); else document.body.appendChild(barra);
    }
    caixa = document.createElement("div");
    caixa.id = id;
    caixa.style.cssText = "background:#F0EFEA;color:#12304F;border:2px solid " + corBorda + ";border-radius:10px;" +
                          "padding:8px 12px;font:bold 14px Arial,sans-serif;";
    barra.appendChild(caixa);
    return caixa;
  }

  function mostrarStatusMQTT(texto) {
    var caixa = caixaNaBarra("mqtt-status", "#4CC9F0");
    caixa.textContent = "📡 MQTT: " + texto;
  }

  // d) Carrega a biblioteca do MQTT e conecta no broker (assim o index.html não precisa mudar)
  function conectarMQTT() {
    mostrarStatusMQTT("Conectando...");
    var biblioteca = document.createElement("script");
    biblioteca.src = "https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js";
    biblioteca.onload = function () {
      clienteMQTT = mqtt.connect(BROKER);
      clienteMQTT.on("connect", function () { mostrarStatusMQTT("✅ Conectado ao broker"); });
      clienteMQTT.on("error", function (erro) { mostrarStatusMQTT("❌ Erro: " + erro.message); });
    };
    biblioteca.onerror = function () { mostrarStatusMQTT("❌ Não consegui carregar a biblioteca (sem internet?)"); };
    document.head.appendChild(biblioteca);
  }

  // e) Monta a mensagem do alerta com os mesmos nomes de campo que o n8n já usa e PUBLICA no tópico
  //    sensor = o sensor com problema | valor = o valor lido | status = "alerta" ou "critico"
  function enviarAlerta(sensor, valor, status, extra) {   // NOVO (Julia): "extra" = campos do machine learning
    if (!clienteMQTT || !clienteMQTT.connected) { mostrarStatusMQTT("❌ Alerta NÃO enviado: sem conexão com o broker"); return; }
    var info = infoSensores[sensor.id];
    var mensagem = {
      maquina: MAQUINA,
      dataHora: new Date().toISOString(),
      status: status === "critico" ? "critico" : "alerta",        // o n8n entende "critico" ou "alerta"
      problema: info.nome + (status === "critico" ? " em nível crítico" : " fora do normal"),
      componente: info.componente,
      setor: info.setor,
      nome: info.nome,
      un: info.un,
      valor: Number(valor.toFixed(sensor.casas)),
      media: sensor.media,
      min: sensor.normalMin,                        // faixa normal (a mesma do cartão)
      max: sensor.normalMax
    };
    for (var campo in (extra || {})) mensagem[campo] = extra[campo];   // NOVO (Julia): junta os campos do ML

    // QoS 1 = "pelo menos uma vez": o broker precisa confirmar (PUBACK)
    clienteMQTT.publish(TOPICO, JSON.stringify(mensagem), { qos: 1 }, function (erro) {
      mostrarStatusMQTT(erro ? "❌ Alerta NÃO enviado: " + erro.message : "📤 Alerta enviado e confirmado pelo broker (QoS 1)");
    });
  }

  // f) Os valores caminham aos poucos até o problema. Esta função só envia UMA vez por problema:
  //    quando o sensor chega no nível que foi pedido (alerta ou critico).
  function conferirEnvio(sensor, valor, status) {
    if (!sensor.nivelProblema || sensor.enviado) return;           // sem problema, ou já enviado
    if (sensor.ml && sensor.ml.avisou && status !== "critico") return;  // NOVO (Julia): o ML já avisou; só manda de novo se virar crítico
    var chegou = (status === "critico") || (status === "alerta" && sensor.nivelProblema === "alerta");
    if (chegou) {
      sensor.enviado = true;
      enviarAlerta(sensor, valor, status);
    }
  }

  conectarMQTT();
  // ================= FIM DO MQTT =================

  // ================= NOVO (Julia): MACHINE LEARNING (detecção de anomalia) =================
  // A ideia: o sistema APRENDE o normal DESTA bomba (a média e a variação comum de cada sensor)
  // e avisa quando uma leitura foge muito desse padrão, ANTES de passar do limite fixo da faixa.
  // É um modelo estatístico simples (z-score): z = (leitura - média aprendida) / desvio padrão aprendido.
  var ML_APRENDER = 8;   // quantas leituras normais ele usa para aprender o padrão
  var ML_LIMITE = 3;     // a partir de quantos desvios padrão de distância já é anomalia
  var ML_JANELA = 30;    // guarda só as últimas 30 leituras normais (vai se atualizando)
  var mlAviso = "";      // a última anomalia encontrada (fica na tela até reiniciar)

  // a) Caixinha no canto esquerdo mostrando o que o ML está fazendo
  function mostrarStatusML(texto) {
    var caixa = caixaNaBarra("ml-status", "#7B61FF");
    caixa.textContent = "🤖 ML: " + texto;
  }

  // b) Média e desvio padrão de uma lista de números
  function mlEstatistica(lista) {
    var media = lista.reduce(function (a, b) { return a + b; }, 0) / lista.length;
    var variancia = lista.reduce(function (a, b) { return a + (b - media) * (b - media); }, 0) / lista.length;
    // o desvio nunca fica menor que 1% da média (evita alarme falso por ruído pequeno do sensor)
    return { media: media, desvio: Math.max(Math.sqrt(variancia), Math.abs(media) * 0.01) };
  }

  function mlNumero(n, casas) { return n.toFixed(casas).replace(".", ","); }

  // c) Atualiza a caixinha: aprendendo, monitorando ou anomalia encontrada
  function mlAtualizarTela() {
    if (mlAviso) { mostrarStatusML(mlAviso); return; }
    var menor = Math.min.apply(null, sensores.map(function (s) { return s.ml ? s.ml.normais.length : 0; }));
    if (menor < ML_APRENDER) mostrarStatusML("aprendendo o normal desta bomba... (" + menor + "/" + ML_APRENDER + " leituras)");
    else mostrarStatusML("normal desta bomba aprendido ✅ monitorando os 5 sensores");
  }

  // d) Roda a cada segundo, para cada sensor: aprende ou procura anomalia
  function mlAnalisar(s, valor) {
    if (!s.ml) s.ml = { normais: [], avisou: false, anterior: null };
    var m = s.ml;

    // Fase 1: ainda aprendendo o normal desta bomba
    if (m.normais.length < ML_APRENDER) {
      m.normais.push(valor);
      m.anterior = valor;
      mlAtualizarTela();
      return;
    }

    // Fase 2: compara a leitura com o padrão aprendido
    var est = mlEstatistica(m.normais);
    var z = (valor - est.media) / est.desvio;

    if (Math.abs(z) < 3) {                                   // leitura normal: continua aprendendo
      m.normais.push(valor);
      if (m.normais.length > ML_JANELA) m.normais.shift();
    } else if (Math.abs(z) >= ML_LIMITE && !m.avisou && !s.enviado) {
      m.avisou = true;
      var info = infoSensores[s.id];
      var statusRegra = calcularStatus(s, valor);
      var porcento = Math.abs(valor - est.media) / est.media * 100;
      var direcao = valor < est.media ? "abaixo" : "acima";

      // Previsão: no ritmo atual, em quantos segundos passa do limite da faixa normal?
      var velocidade = m.anterior === null ? 0 : valor - m.anterior;
      var limite = velocidade < 0 ? s.normalMin : s.normalMax;
      var previsao = "";
      if (statusRegra === "normal" && velocidade !== 0 && (limite - valor) / velocidade > 0) {
        previsao = " No ritmo atual, passa do limite da faixa em cerca de " + Math.ceil((limite - valor) / velocidade) + " s.";
      }

      var explicacao = "O machine learning aprendeu que o normal desta bomba é " + mlNumero(est.media, s.casas) + " " + info.un +
        ". A leitura " + mlNumero(valor, s.casas) + " " + info.un + " está " + mlNumero(porcento, 0) + "% " + direcao +
        " desse normal, uma distância de " + mlNumero(Math.abs(z), 1) + " desvios padrão (o comum é até 3)" +
        (statusRegra === "normal" ? ", mesmo ainda dentro da faixa segura (" + s.normalMin + " a " + s.normalMax + ")." : ".") + previsao;

      enviarAlerta(s, valor, statusRegra === "critico" ? "critico" : "alerta", {
        problema: info.nome + (statusRegra === "normal" ? ": tendência anormal detectada pelo ML (ainda dentro da faixa)" : " fora do padrão (detectado pelo ML)"),
        causa: explicacao,
        ml: mlNumero(Math.abs(z), 1) + " desvios padrão"
      });
      if (statusRegra === "critico") s.enviado = true;       // já foi como crítico: não precisa mandar de novo

      mlAviso = info.nome + " fora do padrão (" + mlNumero(Math.abs(z), 1) + " desvios)" +
        (statusRegra === "normal" ? " → alerta enviado ANTES do limite!" : " → alerta enviado");
      mlAtualizarTela();
    }
    m.anterior = valor;
  }

  // e) Zera os avisos ao reiniciar (o normal aprendido continua guardado, como numa máquina real)
  function mlReiniciar() {
    mlAviso = "";
    for (var i = 0; i < sensores.length; i++) {
      if (sensores[i].ml) { sensores[i].ml.avisou = false; sensores[i].ml.anterior = null; }
    }
    mlAtualizarTela();
  }
  // ================= FIM DO MACHINE LEARNING =================

  // 3) ENCONTRAR AS PEÇAS DA PÁGINA pelo id
  var bomba = document.getElementById("bomba");
  var cardStatus = document.getElementById("card-status");
  var tituloStatus = document.getElementById("status-titulo");
  var textoStatus = document.getElementById("status-texto");
  var botaoIniciar = document.getElementById("botao-iniciar");
  var botaoAlerta = document.getElementById("botao-alerta");
  var botaoCritico = document.getElementById("botao-critico");
  var botaoReiniciar = document.getElementById("botao-reiniciar");

  // 4) AS FUNÇÕES (cada uma faz uma coisa)

  // Decide o status de um valor: "normal", "alerta" ou "critico".
  function calcularStatus(sensor, valor) {
    if (valor < sensor.criticoMenorQue || valor > sensor.criticoMaiorQue) return "critico";
    if (valor >= sensor.normalMin && valor <= sensor.normalMax) return "normal";
    return "alerta";   // fora do normal, mas ainda sem chegar no nível crítico
  }

  // Troca a cor e os textos do card de status. "chave" é: desligado, normal, alerta ou critico.
  function mostrarCard(chave) {
    cardStatus.className = "card-status " + chave;
    tituloStatus.textContent = mensagens[chave].titulo;
    textoStatus.textContent = mensagens[chave].texto;
  }

  // Liga a bomba e agenda um problema para daqui a 8 a 20 segundos.
  function iniciar() {
    ligado = true;
    bomba.classList.add("ligada");           // o CSS vê essa classe e começa a animar
    botaoIniciar.disabled = true;
    relogioSensores = setInterval(atualizar, 1000);                            // "a cada 1 s, rode atualizar"
    relogioProblema = setTimeout(sortearProblema, 8000 + Math.random() * 12000);  // "daqui a X ms, rode sortearProblema"
    atualizar();
  }

  // Sorteia se o problema será um alerta ou um nível crítico.
  function sortearProblema() {
    var nivel = (Math.random() < 0.5) ? "alerta" : "critico";
    provocarProblema(nivel);
  }

  // Escolhe um sensor ao acaso e manda ele caminhar até o valor de alerta ou crítico.
  function provocarProblema(nivel) {
    if (!ligado) return;   // bomba desligada, não faz nada
    var sensor = sensores[Math.floor(Math.random() * sensores.length)];   // sorteio
    sensor.alvo = (nivel === "alerta") ? sensor.alvoAlerta : sensor.alvoCritico;
    sensor.nivelProblema = nivel; sensor.enviado = false;                // NOVO (Julia): marca o problema para enviar
  }

  // Roda a cada segundo: move os valores, calcula os status e atualiza a tela.
  function atualizar() {
    var pior = "normal";   // o pior status entre todos os sensores
    for (var i = 0; i < sensores.length; i++) {
      var s = sensores[i];
      s.valor = s.valor + (s.alvo - s.valor) * 0.35;                    // anda 35% do caminho até o alvo
      var mostrado = s.valor * (1 + (Math.random() - 0.5) * 0.04);     // pequena variação, para parecer vivo
      var status = calcularStatus(s, mostrado);
      mlAnalisar(s, mostrado);                                         // NOVO (Julia): machine learning olha a leitura primeiro
      conferirEnvio(s, mostrado, status);                              // NOVO (Julia): envia quando o problema chega

      document.getElementById("valor-" + s.id).textContent = mostrado.toFixed(s.casas).replace(".", ",");
      document.getElementById("status-" + s.id).textContent = nomesStatus[status];
      document.getElementById("card-" + s.id).className = "sensor " + status;               // muda a cor do cartão
      document.getElementById("anel-" + s.id).setAttribute("class", "anel " + status);      // mostra ou esconde o anel

      if (status === "critico") pior = "critico";
      if (status === "alerta" && pior !== "critico") pior = "alerta";
    }

    // O card de cima mostra o pior caso.
    if (pior === "critico") mostrarCard("critico");
    else if (pior === "alerta") mostrarCard("alerta");
    else mostrarCard("normal");
  }

  // Volta tudo ao começo.
  function reiniciar() {
    clearTimeout(relogioProblema);
    clearInterval(relogioSensores);
    ligado = false;
    bomba.classList.remove("ligada");
    botaoIniciar.disabled = false;
    mostrarCard("desligado");
    for (var i = 0; i < sensores.length; i++) {
      var s = sensores[i];
      s.valor = s.media;   // o valor atual
      s.alvo = s.media;    // para onde ele está caminhando
      s.nivelProblema = null; s.enviado = false;   // NOVO (Julia): zera o controle de envio
      document.getElementById("valor-" + s.id).textContent = "--";
      document.getElementById("status-" + s.id).textContent = "Aguardando";
      document.getElementById("card-" + s.id).className = "sensor desligado";
      document.getElementById("anel-" + s.id).setAttribute("class", "anel desligado");
    }
    mlReiniciar();   // NOVO (Julia): zera os avisos do machine learning
  }

  // 5) LIGAR CADA BOTÃO À SUA FUNÇÃO
  // "Quando clicarem neste botão, rode esta função."
  botaoIniciar.addEventListener("click", iniciar);
  botaoReiniciar.addEventListener("click", reiniciar);
  // Estes dois precisam passar uma informação ("alerta" ou "critico"), então usam uma função sem nome:
  botaoAlerta.addEventListener("click", function () { provocarProblema("alerta"); });
  botaoCritico.addEventListener("click", function () { provocarProblema("critico"); });

  reiniciar();   // deixa a página no estado inicial (desligado)