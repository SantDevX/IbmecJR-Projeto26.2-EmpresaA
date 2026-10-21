// ================= JavaScript: o comportamento =================

  // 1) OS DADOS
  // Uma lista com os 5 sensores, com os números da tabela:
  //   media            = valor típico quando tudo vai bem
  //   normalMin/Max    = faixa normal (verde)
  //   riscoMenorQue    = abaixo disso é risco (vermelho)
  //   riscoMaiorQue    = acima disso é risco (vermelho)
  //   alvoAlerta/Risco = valor para onde o sensor caminha quando simulamos um problema
  //   casas            = quantas casas decimais mostrar
  // Se mudar uma faixa, mude também o texto dela no HTML.
  var sensores = [
    { id: "vazao",       media: 120, casas: 0, normalMin: 108, normalMax: 132, riscoMenorQue: 90,  riscoMaiorQue: 150, alvoAlerta: 100,  alvoRisco: 80  },
    { id: "pressao",     media: 50,  casas: 1, normalMin: 46,  normalMax: 55,  riscoMenorQue: 40,  riscoMaiorQue: 60,  alvoAlerta: 43,   alvoRisco: 35  },
    { id: "temperatura", media: 80,  casas: 1, normalMin: 70,  normalMax: 90,  riscoMenorQue: 60,  riscoMaiorQue: 100, alvoAlerta: 94,   alvoRisco: 105 },
    { id: "vibracao",    media: 3,   casas: 2, normalMin: 0.5, normalMax: 4.5, riscoMenorQue: 0,   riscoMaiorQue: 7,   alvoAlerta: 5.7,  alvoRisco: 7.8 },
    { id: "consumo",     media: 3.5, casas: 2, normalMin: 3.1, normalMax: 3.9, riscoMenorQue: 2.8, riscoMaiorQue: 4.4, alvoAlerta: 4.15, alvoRisco: 4.7 }
  ];

  // Os textos do card de status (os 3 da imagem, mais o NORMAL para quando tudo vai bem).
  var mensagens = {
    desligado: { titulo: "DESLIGADO", texto: "Clique em Iniciar para começar o monitoramento." },
    normal:    { titulo: "NORMAL",    texto: "Tudo certo. Todos os sensores estão dentro da faixa normal." },
    aviso:     { titulo: "AVISO",     texto: "Problema não urgente. Programe a manutenção." },
    atencao:   { titulo: "ATENÇÃO",   texto: "Problema sério. Não abra a válvula e avise os setores." }
  };

  // O nome de cada status, como aparece na etiqueta do sensor.
  var nomesStatus = { normal: "Normal", alerta: "Alerta", risco: "Risco" };

  // 2) A MEMÓRIA
  var ligado = false;          // a bomba está ligada?
  var relogioProblema = null;  // o "relógio" que vai sortear o problema
  var relogioSensores = null;  // o "relógio" que atualiza os números a cada segundo

  // 3) ENCONTRAR AS PEÇAS DA PÁGINA pelo id
  var bomba = document.getElementById("bomba");
  var cardStatus = document.getElementById("card-status");
  var tituloStatus = document.getElementById("status-titulo");
  var textoStatus = document.getElementById("status-texto");
  var botaoIniciar = document.getElementById("botao-iniciar");
  var botaoAlerta = document.getElementById("botao-alerta");
  var botaoRisco = document.getElementById("botao-risco");
  var botaoReiniciar = document.getElementById("botao-reiniciar");

  // 4) AS FUNÇÕES (cada uma faz uma coisa)

  // Decide o status de um valor: "normal", "alerta" ou "risco".
  function calcularStatus(sensor, valor) {
    if (valor < sensor.riscoMenorQue || valor > sensor.riscoMaiorQue) return "risco";
    if (valor >= sensor.normalMin && valor <= sensor.normalMax) return "normal";
    return "alerta";   // fora do normal, mas ainda sem chegar no risco
  }

  // Troca a cor e os textos do card de status. "chave" é: desligado, normal, aviso ou atencao.
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

  // Sorteia se o problema será um alerta ou um risco.
  function sortearProblema() {
    var nivel = (Math.random() < 0.5) ? "alerta" : "risco";
    provocarProblema(nivel);
  }

  // Escolhe um sensor ao acaso e manda ele caminhar até o valor de alerta ou de risco.
  function provocarProblema(nivel) {
    if (!ligado) return;   // bomba desligada, não faz nada
    var sensor = sensores[Math.floor(Math.random() * sensores.length)];   // sorteio
    sensor.alvo = (nivel === "alerta") ? sensor.alvoAlerta : sensor.alvoRisco;
  }

  // Roda a cada segundo: move os valores, calcula os status e atualiza a tela.
  function atualizar() {
    var pior = "normal";   // o pior status entre todos os sensores
    for (var i = 0; i < sensores.length; i++) {
      var s = sensores[i];
      s.valor = s.valor + (s.alvo - s.valor) * 0.35;                    // anda 35% do caminho até o alvo
      var mostrado = s.valor * (1 + (Math.random() - 0.5) * 0.04);     // pequena variação, para parecer vivo
      var status = calcularStatus(s, mostrado);

      document.getElementById("valor-" + s.id).textContent = mostrado.toFixed(s.casas).replace(".", ",");
      document.getElementById("status-" + s.id).textContent = nomesStatus[status];
      document.getElementById("card-" + s.id).className = "sensor " + status;               // muda a cor do cartão
      document.getElementById("anel-" + s.id).setAttribute("class", "anel " + status);      // mostra ou esconde o anel

      if (status === "risco") pior = "risco";
      if (status === "alerta" && pior !== "risco") pior = "alerta";
    }

    // O card de cima mostra o pior caso.
    if (pior === "risco") mostrarCard("atencao");
    else if (pior === "alerta") mostrarCard("aviso");
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
      document.getElementById("valor-" + s.id).textContent = "--";
      document.getElementById("status-" + s.id).textContent = "Aguardando";
      document.getElementById("card-" + s.id).className = "sensor desligado";
      document.getElementById("anel-" + s.id).setAttribute("class", "anel desligado");
    }
  }

  // 5) LIGAR CADA BOTÃO À SUA FUNÇÃO
  // "Quando clicarem neste botão, rode esta função."
  botaoIniciar.addEventListener("click", iniciar);
  botaoReiniciar.addEventListener("click", reiniciar);
  // Estes dois precisam passar uma informação ("alerta" ou "risco"), então usam uma função sem nome:
  botaoAlerta.addEventListener("click", function () { provocarProblema("alerta"); });
  botaoRisco.addEventListener("click", function () { provocarProblema("risco"); });

  reiniciar();   // deixa a página no estado inicial (desligado)
