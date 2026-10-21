// ================= JavaScript: o comportamento =================

  // 1) AS PEÇAS DA VÁLVULA
  // Os números e os nomes são os da tabela "Material Specification" da choke de luva externa (External Sleeve Choke Valve), catálogo DHV, página 6.
  // Cada peça: [nome em português, nome no catálogo]. O nome só aparece na tela quando a peça tem problema.
  // As chaves "Zentrada" e "Zsaida" não são peças: são as regiões por onde o fluido entra e sai.
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

  // 2) OS PROBLEMAS
  // Todos vêm do que está nos documentos enviados (catálogo DHV, McIlvaine Choke Valve Decision Guide e proposta ChokeGuard IA).
  //   nivel      = "aviso" (amarelo, não urgente) ou "atencao" (vermelho, urgente)
  //   sensores   = quais sensores passam a mostrar valor ruim, e qual valor
  //   dias       = quantos dias restam (null quando é urgente). São estimativas de demonstração.
  //   pendencias = o que precisa ser fechado ANTES da manutenção. Lista vazia [] = SEGURO.
  //   foco       = onde fica o problema: pecas (números da lista acima), efeito (areia, bolhas, gotas ou nada) e o texto da etiqueta
  //   fonte      = em que parte dos documentos o problema aparece
  var pendIsolar = ["Fechar e travar a válvula de bloqueio (wing valve)",
                    "Despressurizar a linha pelo dreno até chegar a 0 psi",
                    "Conferir se as válvulas de desvio (bypass) estão na posição do diagrama"];
  var pendFuro = ["Parar a linha e isolar a área",
                  "Esperar a equipe de segurança liberar (risco de gás escapando)",
                  "Fechar e travar a válvula de bloqueio (wing valve)"];

  var falhas = [
    { nome: "Desgaste começando no trim", nivel: "aviso", setor: "Manutenção e Compras",
      sensores: { desvio: 7, areia: 4, vazao: 168 }, dias: 16,
      causa: "A areia começa a desgastar a gaiola e a bucha (o trim). O orifício está um pouco maior que o normal.",
      acao: "Agendar inspeção na próxima parada planejada e comprar a peça de reposição.",
      pendencias: [],
      foco: { pecas: [6, 7], efeito: "areia", rotulo: "Gaiola e bucha do trim" },
      fonte: "McIlvaine slides 9 a 11 (Pentair): o trim é o ponto crítico e a areia é a maior causa de falha." },

    { nome: "Erosão grave do trim por areia", nivel: "atencao", setor: "Manutenção, Compras, Financeiro e Segurança",
      sensores: { desvio: 22, areia: 8, vazao: 192 }, dias: null,
      causa: "O desvio do Cv passou do limite crítico. A areia comeu a gaiola, a bucha e a luva, e o trim pode ceder de repente.",
      acao: "Planejar a troca do trim com urgência e reduzir a queda de pressão enquanto isso.",
      pendencias: pendIsolar,
      foco: { pecas: [6], efeito: "areia", rotulo: "Trim erodido: gaiola, bucha e luva" },
      fonte: "McIlvaine slides 9, 11 e 33; catálogo DHV p. 5 (trim projetado para serviço com areia)." },

    { nome: "Choke cada vez mais fechada (círculo vicioso)", nivel: "aviso", setor: "Operação, Manutenção e Financeiro",
      sensores: { abertura: 42, desvio: 12, vibracao: 5 }, dias: 10,
      causa: "O trim erodiu e perdeu controle. Para manter a vazão, o operador aproxima mais a luva do assento, e isso acelera ainda mais a erosão e a vibração.",
      acao: "Trocar o trim em vez de continuar fechando a válvula. Mostrar ao financeiro o custo de adiar contra o de parar de forma planejada.",
      pendencias: [],
      foco: { pecas: [7, 8], efeito: "", rotulo: "Luva e bucha quase fechadas" },
      fonte: "McIlvaine slide 33 (CCI): o ciclo trim erode, controle piora, operador fecha mais, erosão acelera." },

    { nome: "Vibração por cavitação", nivel: "aviso", setor: "Manutenção",
      sensores: { vibracao: 7, pressaoSaida: 500 }, dias: 30,
      causa: "A queda de pressão é alta e formam-se bolhas no fluido logo depois da restrição. Elas estouram, causam vibração e danificam o metal.",
      acao: "Reduzir a queda de pressão e acompanhar a vibração nos próximos dias.",
      pendencias: [],
      foco: { pecas: [6, 7], efeito: "bolhas", rotulo: "Cavitação depois dos furos da gaiola" },
      fonte: "McIlvaine slides 20 (Kentintrol), 24 (Cameron) e 51 (Mokveld)." },

    { nome: "Queda de pressão excessiva (gás expandindo)", nivel: "atencao", setor: "Operação, Manutenção e Segurança",
      sensores: { pressaoEntrada: 5000, pressaoSaida: 200, vazao: 210, vibracao: 8 }, dias: null,
      causa: "A queda de pressão é enorme. O gás que vai de 5000 psi até a pressão atmosférica expande cerca de 340 vezes e acelera junto, e a vida da choke pode ser de minutos.",
      acao: "Reduzir a queda de pressão. Dividir a queda em etapas, com três ou mais chokes em série.",
      pendencias: pendIsolar,
      foco: { pecas: [6, 7, "Zsaida"], efeito: "", rotulo: "Trim e saída: velocidade altíssima" },
      fonte: "McIlvaine slide 9: expansão de 340 vezes e vida medida em minutos." },

    { nome: "Erosão do corpo na saída (risco de furo)", nivel: "atencao", setor: "Segurança e Operação",
      sensores: { vibracao: 6, areia: 6, vazao: 185 }, dias: null,
      causa: "A velocidade alta do fluido com areia desgasta o corpo de aço na saída. A parede pode furar e o gás escapar.",
      acao: "Isolar a área, avisar a equipe de segurança e parar a linha.",
      pendencias: pendFuro,
      foco: { pecas: [1, "Zsaida"], efeito: "areia", rotulo: "Corpo e saída: parede afinando" },
      fonte: "McIlvaine slides 24 (Cameron: revestimento duro na saída) e 51 (Mokveld: velocidade alta erode o corpo)." },

    { nome: "Vazamento nos O-rings (descompressão explosiva)", nivel: "atencao", setor: "Segurança e Manutenção",
      sensores: { pressaoEntrada: 2750, vazao: 150 }, dias: null,
      causa: "Sob alta pressão, os anéis de vedação (O-rings) podem rasgar ou deformar por descompressão explosiva e perdem a vedação. O fluido escapa.",
      acao: "Isolar a área, avisar a segurança, parar a linha e trocar as vedações com material adequado.",
      pendencias: pendFuro,
      foco: { pecas: [27, 20], efeito: "gotas", rotulo: "Vedações do corpo/castelo e da luva" },
      fonte: "McIlvaine slide 51 (Mokveld): O-rings, em especial de Viton, sofrem descompressão explosiva." },

    { nome: "Vazamento pela haste (gaxeta e vedação)", nivel: "atencao", setor: "Segurança e Manutenção",
      sensores: { pressaoEntrada: 2850 }, dias: null,
      causa: "O fluido escapa pela região da haste, onde ficam a gaxeta e a vedação. Em uso dinâmico, as vedações são as que mais falham.",
      acao: "Isolar a área, avisar a segurança e trocar a gaxeta e a vedação da haste na manutenção.",
      pendencias: pendFuro,
      foco: { pecas: [14, 15], efeito: "gotas", rotulo: "Gaxeta e vedação da haste" },
      fonte: "McIlvaine slide 51 (Mokveld: vazamentos e vedações); catálogo DHV p. 6 (gaxeta e vedação da haste)." },

    { nome: "Corrosão do corpo (CO2 úmido ou H2S)", nivel: "aviso", setor: "Manutenção e Compras",
      sensores: { areia: 4, desvio: 3 }, dias: 45,
      causa: "O material do corpo e do castelo não é o certo para o fluido deste poço (CO2 úmido ou H2S). A corrosão desgasta o metal e solta partículas.",
      acao: "Conferir o tipo de serviço do poço e escolher o material certo (serviço ácido ou de CO2 úmido) na próxima troca.",
      pendencias: [],
      foco: { pecas: [1, 2], efeito: "", rotulo: "Corpo e castelo: material errado" },
      fonte: "McIlvaine slides 25 (Cameron: estilos para CO2 úmido e serviço ácido), 46 e 51 (Mokveld: corrosão e material errado)." },

    { nome: "Entupimento dos furos da gaiola (areia e incrustação)", nivel: "aviso", setor: "Operação e Manutenção",
      sensores: { vazao: 105, desvio: -28, pressaoEntrada: 3300, pressaoSaida: 600, areia: 6 }, dias: 5,
      causa: "Areia, incrustação ou partículas de corrosão bloqueiam os furos da gaiola. A vazão cai e o desvio do Cv fica negativo.",
      acao: "Programar a limpeza ou a troca da gaiola e conferir se o trim passa areia sem entupir.",
      pendencias: [],
      foco: { pecas: [6, 7], efeito: "areia", rotulo: "Furos da gaiola bloqueados" },
      fonte: "McIlvaine slides 9 (sólidos), 25 (detritos bloqueiam a restrição) e 49 (Master Flo: risco de entupimento)." },

    { nome: "Congelamento (gelo) na choke", nivel: "aviso", setor: "Operação e Manutenção",
      sensores: { temperatura: -8, vazao: 95, pressaoSaida: 1100 }, dias: 2,
      causa: "A temperatura cai a ponto de formar gelo na saída e no orifício. A vazão diminui e a pressão de saída sobe.",
      acao: "Reduzir a queda de pressão, aquecer a linha se houver aquecedor e acompanhar a temperatura.",
      pendencias: [],
      foco: { pecas: [6, "Zsaida"], efeito: "", rotulo: "Saída e furos da gaiola: gelo" },
      fonte: "McIlvaine slides 4 e 24 (congelamento entre as maiores ameaças) e 9 (gelo entre os sólidos)." },

    { nome: "Engripamento (galling) da haste e da luva", nivel: "aviso", setor: "Manutenção e Compras",
      sensores: { vibracao: 4, desvio: 2 }, dias: 20,
      causa: "Peças de metal que deslizam uma sobre a outra, com combinação de materiais inadequada, se arranham e começam a travar.",
      acao: "Inspecionar a haste e a luva e usar materiais com proteção contra galling (por exemplo, revestimento de carboneto de tungstênio).",
      pendencias: [],
      foco: { pecas: [5, 8], efeito: "", rotulo: "Haste e luva arranhando" },
      fonte: "McIlvaine slides 47 (Master Flo: prevenção de galling) e 51 (Mokveld: combinação de materiais)." },

    { nome: "Carboneto de tungstênio trincado (vibração)", nivel: "atencao", setor: "Manutenção, Compras e Segurança",
      sensores: { vibracao: 9, desvio: 18, areia: 3 }, dias: null,
      causa: "A vibração da cavitação pode quebrar materiais frágeis, como o carboneto de tungstênio da bucha e da gaiola.",
      acao: "Planejar a troca do trim com urgência e reduzir a queda de pressão.",
      pendencias: pendIsolar,
      foco: { pecas: [6, 7], efeito: "bolhas", rotulo: "Carboneto trincado: gaiola e bucha" },
      fonte: "McIlvaine slide 51 (Mokveld); catálogo DHV p. 5 (bocal e bucha opcionais de carboneto de tungstênio)." },

    { nome: "A choke não veda na sede", nivel: "atencao", setor: "Segurança, Operação e Manutenção",
      sensores: { vazao: 60, pressaoSaida: 1300, desvio: 9 }, dias: null,
      causa: "Com a válvula fechada ainda passa fluido pela sede e pelo inserto. A linha depois da choke continua pressurizada.",
      acao: "Isolar com a válvula de bloqueio, despressurizar e trocar a sede e o inserto.",
      pendencias: pendIsolar,
      foco: { pecas: [3, 4], efeito: "", rotulo: "Sede e inserto sem vedar" },
      fonte: "Catálogo DHV p. 5 (vedação independente a montante, sede rosqueada); McIlvaine slide 49 (shutoff Classe V)." },

    { nome: "Colapso do trim e sobrepressão depois da choke", nivel: "atencao", setor: "Manutenção, Compras, Financeiro e Segurança",
      sensores: { pressaoSaida: 2400, desvio: 35, vazao: 230 }, dias: null,
      causa: "O trim cedeu de repente e a restrição sumiu. A pressão do poço chega a vasos e tubulações de baixa pressão que ficam depois da choke.",
      acao: "Fechar o poço pela válvula de bloqueio, avisar a segurança e trocar o trim.",
      pendencias: pendIsolar,
      foco: { pecas: [6, 8, "Zsaida"], efeito: "areia", rotulo: "Trim rompido: pressão passando direto" },
      fonte: "Cenário 1 da proposta ChokeGuard IA (análise de risco da equipe); mecanismo de erosão em McIlvaine slides 9 e 33." },

    { nome: "Pedido de manutenção com linha pressurizada", nivel: "atencao", setor: "Segurança e Manutenção",
      sensores: { pressaoSaida: 850 }, dias: null,
      causa: "Foi pedida a abertura da válvula, mas ainda há 850 psi de pressão residual na linha.",
      acao: "Manter fechada, abrir o dreno e esperar a pressão chegar a zero.",
      pendencias: ["Fechar e travar a válvula de bloqueio (wing valve)",
                   "Abrir o dreno e esperar a pressão residual (850 psi) chegar a 0"],
      foco: { pecas: [33, "Zsaida"], efeito: "", rotulo: "Dreno: aliviar a pressão antes de abrir" },
      fonte: "Catálogo DHV p. 5 (o dreno alivia a pressão antes da desmontagem); proposta ChokeGuard IA, seção 8." }
  ];

  // POR QUE ISSO ACONTECE: para cada problema (na mesma ordem da lista "falhas"), o que costuma causar e a explicação.
  var dicas = [
    { porque: "O fluido do poço carrega areia. Ao passar pelos furos da gaiola em alta velocidade, a areia age como um jato e vai raspando o metal. Cada grão tira um pouco, até o orifício ficar maior que o projetado.",
      causas: ["Produção de areia pelo poço (sólidos no fluido)", "Queda de pressão alta com a válvula pouco aberta, que aumenta a velocidade", "Material do trim sem a dureza necessária, como o carboneto de tungstênio"] },
    { porque: "O desgaste não para sozinho: quanto maior o orifício, mais fluido passa, mais rápido ele corre e mais areia raspa o metal. Quando o desvio passa do limite, a parede do trim pode ceder de uma vez.",
      causas: ["Manutenção adiada com o desgaste já em andamento", "Aumento da areia quando a pressão do poço cai com o passar dos anos", "Falta de acompanhamento do Cv real contra o esperado"] },
    { porque: "Com o trim gasto, a válvula deixa passar mais do que deveria. Para manter a vazão pedida, o operador fecha mais a luva, o fluido passa por uma folga menor e mais rápido, e o desgaste e a vibração aumentam. É um ciclo que se alimenta sozinho.",
      causas: ["Trim já erodido e ainda não trocado", "Ajuste manual para compensar o desgaste", "Sinais da operação ignorados porque a manutenção foi adiada"] },
    { porque: "Quando o fluido acelera ao passar pela restrição, a pressão ali cai abaixo da pressão de vapor e formam-se bolhas. Logo depois a pressão sobe de novo e as bolhas estouram contra o metal, causando erosão e vibração.",
      causas: ["Queda de pressão grande de uma vez só", "Pressão de saída baixa demais", "Trim de um único estágio em serviço de queda de pressão alta"] },
    { porque: "O gás se expande muito quando perde pressão: de 5000 psi até a pressão atmosférica ele ocupa cerca de 340 vezes mais volume, e a velocidade cresce na mesma proporção. Toda a queda numa única choke significa velocidade enorme e vida curta.",
      causas: ["Toda a queda de pressão concentrada em uma só choke", "Poço de pressão alta produzindo direto para baixa pressão", "Abertura pequena para segurar a vazão"] },
    { porque: "Se a velocidade na saída é alta, a areia que sai do trim bate na parede do corpo. Com o tempo a parede afina e, se ninguém inspecionar, pode furar.",
      causas: ["Velocidade de saída acima do recomendado", "Areia no fluido", "Saída do corpo sem revestimento duro nem luva de desgaste"] },
    { porque: "Sob alta pressão, o gás entra no material do anel de borracha. Se a pressão cai rápido, o gás tenta sair de uma vez e rasga ou deforma o anel, que deixa de vedar. Esse efeito se chama descompressão explosiva.",
      causas: ["Material do anel inadequado para o fluido (o Viton é sensível a isso)", "Queda de pressão rápida", "Uso em vedações dinâmicas, onde as peças se movem"] },
    { porque: "A haste se move e a vedação ao redor dela trabalha em movimento, sob pressão alta. É onde as vedações mais sofrem. Quando perdem a capacidade de vedar, o fluido escapa pela haste.",
      causas: ["Desgaste da gaxeta por manobras frequentes", "Vedação de material inadequado", "Pressão e queda de pressão altas"] },
    { porque: "O CO2 úmido e o H2S atacam o metal. Cada poço produz um fluido diferente, e usar uma especificação baseada só na história faz o material errado ser escolhido. A corrosão desgasta o metal e solta partículas.",
      causas: ["Especificação copiada de outro poço", "Presença de CO2 úmido ou H2S no fluido", "Material sem a classe adequada para o serviço"] },
    { porque: "Areia, incrustação e partículas de corrosão se acumulam nos furos da gaiola e bloqueiam a passagem. A vazão cai, o desvio do Cv fica negativo e a pressão antes da choke sobe.",
      causas: ["Produção de sólidos pelo poço", "Incrustação (scale) e partículas de corrosão", "Furos pequenos demais para a areia que o fluido carrega"] },
    { porque: "As fontes citam o congelamento como uma das maiores ameaças ao controle de fluxo. Uma grande queda de pressão pode esfriar o fluido e, havendo água, o gelo se acumula na saída e no orifício e bloqueia a passagem.",
      causas: ["Queda de pressão grande, que esfria o fluido", "Presença de água no fluido", "Temperatura baixa do poço ou do ambiente"] },
    { porque: "Quando duas peças de metal deslizam uma sobre a outra sob pressão, algumas combinações de materiais agarram e arrancam pedaços da superfície. A peça passa a arranhar e travar. Por isso se evita contato de metal com metal em peças que deslizam.",
      causas: ["Combinação de materiais inadequada", "Contato de metal com metal em peças deslizantes", "Haste sem revestimento de proteção, como carboneto de tungstênio"] },
    { porque: "O carboneto de tungstênio resiste muito à areia, mas é frágil. A vibração, em especial a da cavitação, pode quebrá-lo. Sem a proteção, o trim passa a se desgastar muito mais rápido.",
      causas: ["Cavitação prolongada", "Vibração causada por trim já erodido", "Operação com queda de pressão alta"] },
    { porque: "A sede garante o fechamento. Se areia, erosão ou desgaste marcam a superfície, a vedação deixa de ser perfeita e passa fluido mesmo com a válvula fechada. Por isso o catálogo destaca a vedação independente da sede.",
      causas: ["Erosão da sede e do inserto pela areia", "Sede mal assentada ou com a rosca danificada", "Desgaste pelo uso ao longo do tempo"] },
    { porque: "A choke segura contrapressão. Se o trim cede de repente, a restrição desaparece e a pressão do poço passa direto para equipamentos projetados para uma pressão bem menor, com risco de ruptura.",
      causas: ["Erosão por areia, com a válvula meses sem vistoria", "Sinais de mais areia ignorados", "Falta de previsão da vida restante do trim"] },
    { porque: "Mesmo com a válvula fechada, a linha pode guardar pressão residual. Abrir o corpo assim solta fluido e gás sobre quem está trabalhando. O dreno existe para aliviar essa pressão antes de desmontar.",
      causas: ["Dreno fechado ou não usado antes da abertura", "Isolamento feito na ordem errada", "Falha de comunicação sobre o estado da linha"] }
  ];

  // Os valores normais de cada sensor, quando está tudo bem.
  var normais = { pressaoEntrada: 3000, pressaoSaida: 800, vazao: 158, desvio: 1, areia: 1, vibracao: 2.4, abertura: 64, temperatura: 60 };

  // Quantas casas depois da vírgula cada sensor mostra.
  var casasDecimais = { pressaoEntrada: 0, pressaoSaida: 0, vazao: 0, desvio: 1, areia: 0, vibracao: 1, abertura: 0, temperatura: 0 };

  // O que a faixa de estado mostra em cada situação.
  var estados = {
    desligado: { nome: "DESLIGADO", texto: "Clique em Iniciar para começar o monitoramento." },
    normal:    { nome: "NORMAL",    texto: "Nenhum problema. A válvula está funcionando bem." },
    aviso:     { nome: "AVISO",     texto: "Problema não urgente. Programe a manutenção." },
    atencao:   { nome: "ATENÇÃO",   texto: "Problema sério. Não abra a válvula e avise os setores." }
  };

  // 3) A MEMÓRIA
  var falhaAtual = null;
  var sistemaLigado = false;
  var relogioFalha = null;
  var relogioSensores = null;

  // ================= NOVO (Julia): envio do alerta para o n8n pelo MQTT =================
  // Tudo que está entre esta linha e "FIM DO MQTT" foi adicionado. O resto do arquivo continua igual.

  // a) Onde fica o broker (o "carteiro") e em qual tópico (o "grupo") este protótipo publica
  var BROKER = "wss://broker.hivemq.com:8884/mqtt";
  var TOPICO = "inspectai-ibmecjr/compressor/CHOKE-01";
  var MAQUINA = "Válvula Choke 01";
  var clienteMQTT = null;

  // b) Informações de cada sensor que o n8n precisa: nome, unidade e faixa segura (min e max)
  //    As faixas são valores de demonstração, escolhidos em volta dos valores normais.
  var infoSensores = {
    pressaoEntrada: { nome: "Pressão de entrada", un: "psi",  min: 2900, max: 3200 },
    pressaoSaida:   { nome: "Pressão de saída",   un: "psi",  min: 700,  max: 900 },
    vazao:          { nome: "Vazão",              un: "gpm",  min: 130,  max: 180 },
    desvio:         { nome: "Desvio do Cv",       un: "%",    min: -5,   max: 5 },
    areia:          { nome: "Nível de areia",     un: "/10",  min: 0,    max: 3 },
    vibracao:       { nome: "Vibração",           un: "mm/s", min: 0,    max: 3.5 },
    abertura:       { nome: "Abertura da choke",  un: "%",    min: 50,   max: 75 },
    temperatura:    { nome: "Temperatura",        un: "°C",   min: 10,   max: 80 }
  };

  // c) Mostra no canto da tela se o MQTT está conectado e se o alerta foi enviado
  function mostrarStatusMQTT(texto) {
    var caixa = document.getElementById("mqtt-status");
    if (!caixa) {                                   // se ainda não existe, cria a caixinha
      caixa = document.createElement("div");
      caixa.id = "mqtt-status";
      caixa.style.cssText = "position:fixed;bottom:12px;right:12px;z-index:9;background:#F5F4EF;color:#153049;" +
                            "border:2px solid #1D908F;border-radius:10px;padding:8px 12px;font:bold 14px Arial,sans-serif;";
      document.body.appendChild(caixa);
    }
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

  // e) Escolhe o sensor principal do problema: o que mais saiu do normal, comparando com o tamanho da faixa
  function sensorPrincipal(falha) {
    var melhor = null, maiorDesvio = -1;
    for (var nome in falha.sensores) {
      var info = infoSensores[nome];
      var desvioRelativo = Math.abs(falha.sensores[nome] - normais[nome]) / (info.max - info.min);
      if (desvioRelativo > maiorDesvio) { maiorDesvio = desvioRelativo; melhor = nome; }
    }
    return melhor;
  }

  // f) Monta a mensagem do alerta com os mesmos nomes de campo que o n8n já usa e PUBLICA no tópico
  function enviarAlerta(falha) {
    if (!clienteMQTT || !clienteMQTT.connected) { mostrarStatusMQTT("❌ Alerta NÃO enviado: sem conexão com o broker"); return; }
    var principal = sensorPrincipal(falha);
    var info = infoSensores[principal];

    var outros = [];                                // todos os sensores afetados, em texto
    for (var nome in falha.sensores) {
      outros.push(infoSensores[nome].nome + ": " + falha.sensores[nome] + " " + infoSensores[nome].un);
    }

    var mensagem = {
      maquina: MAQUINA,
      dataHora: new Date().toISOString(),
      status: falha.nivel === "atencao" ? "critico" : "alerta",   // o n8n entende "critico" ou "alerta"
      problema: falha.nome,
      causa: falha.causa,
      acao: falha.acao,
      dias: falha.dias,
      setor: falha.setor,
      nome: info.nome,                              // o sensor principal do problema
      un: info.un,
      valor: falha.sensores[principal],
      media: normais[principal],
      min: info.min,
      max: info.max,
      sensoresAfetados: outros.join("; ")
    };

    // QoS 1 = "pelo menos uma vez": o broker precisa confirmar (PUBACK)
    clienteMQTT.publish(TOPICO, JSON.stringify(mensagem), { qos: 1 }, function (erro) {
      mostrarStatusMQTT(erro ? "❌ Alerta NÃO enviado: " + erro.message : "📤 Alerta enviado e confirmado pelo broker (QoS 1)");
    });
  }

  conectarMQTT();
  // ================= FIM DO MQTT =================

  // 4) ENCONTRAR AS PEÇAS DA PÁGINA pelo id
  var valvula = document.getElementById("valvula");
  var caixaEstado = document.getElementById("estado");
  var caixaRelatorio = document.getElementById("relatorio");
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

  // 5) AS FUNÇÕES

  // Cria um botão para cada problema da lista, na sub aba do "Forçar problema".
  function montarSubmenu() {
    var html = "";
    for (var i = 0; i < falhas.length; i++) {
      html += '<button type="button" onclick="dispararFalha(' + i + ')">' + falhas[i].nome +
              ' <span class="tag ' + falhas[i].nivel + '">' + estados[falhas[i].nivel].nome + '</span></button>';
    }
    document.getElementById("submenu-lista").innerHTML = html;
  }

  function mostrarEstado(tipo) {
    caixaEstado.className = "estado " + tipo;
    document.getElementById("estado-nome").textContent = estados[tipo].nome;
    document.getElementById("estado-texto").textContent = estados[tipo].texto;
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
    enviarAlerta(falhaAtual);                             // NOVO (Julia): manda o alerta pro n8n

    valvula.classList.remove("aviso", "atencao");
    valvula.classList.add("ligada", falhaAtual.nivel);
    if (falhaAtual.nivel === "atencao") {
      valvula.classList.remove("ligada");
    }
    submenu.hidden = true;
    mostrarEstado(falhaAtual.nivel);
    criarRelatorio(falhaAtual);
    mostrarDicas(posicao);
    mostrarLocal(falhaAtual.foco);                        // destaca no desenho a(s) peça(s) com defeito
    limparManutencao();
    atualizarSensores();
  }

  // O "relatório do sistema": pega os dados do problema e escreve o relatório na tela.
  function criarRelatorio(falha) {
    var textoDias = "Sem previsão: agir agora.";
    if (falha.dias !== null) textoDias = "Cerca de " + falha.dias + " dias até o limite crítico.";

    var nomes = [];
    for (var i = 0; i < falha.foco.pecas.length; i++) {
      var k = falha.foco.pecas[i];
      nomes.push(pecas[k][0] + (pecas[k][1] ? " (" + pecas[k][1] + ")" : ""));
    }

    document.getElementById("rel-hora").textContent = new Date().toLocaleTimeString("pt-BR");
    document.getElementById("rel-setor").textContent = falha.setor;
    document.getElementById("rel-nivel").textContent = estados[falha.nivel].nome;
    document.getElementById("rel-nome").textContent = falha.nome;
    document.getElementById("rel-causa").textContent = falha.causa;
    document.getElementById("rel-dias").textContent = textoDias;
    document.getElementById("rel-acao").textContent = falha.acao;
    document.getElementById("rel-local").textContent = nomes.join("; ");
    document.getElementById("rel-fonte").textContent = falha.fonte;

    caixaRelatorio.classList.remove("aviso", "atencao");
    caixaRelatorio.classList.add(falha.nivel);
    caixaRelatorio.hidden = false;
  }

  // Destaca as peças com defeito: pinta o contorno, desenha uma caixa tracejada em volta e escreve a etiqueta.
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

    alvo.removeAttribute("hidden");                        // precisa aparecer antes de medir o texto
    alvoAnel.setAttribute("x", x1 - 7); alvoAnel.setAttribute("y", y1 - 7);
    alvoAnel.setAttribute("width", x2 - x1 + 14); alvoAnel.setAttribute("height", y2 - y1 + 14);

    alvoTexto.textContent = foco.rotulo;
    var larg = alvoTexto.getComputedTextLength();
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, lx, ly = cy, ax, ay = cy, bx, by;
    if (x2 + 26 + larg < 556) {                            // etiqueta à direita
      lx = x2 + 26; ax = x2 + 7; bx = lx - 6; by = ly - 4;
    } else if (x1 - 26 - larg > 4) {                       // etiqueta à esquerda
      lx = x1 - 26 - larg; ax = x1 - 7; bx = lx + larg + 6; by = ly - 4;
    } else {                                               // etiqueta embaixo
      lx = Math.min(x1, 552 - larg); ly = y2 + 34; ax = cx; ay = y2 + 7; bx = lx + larg / 2; by = ly - 15;
    }
    alvoTexto.setAttribute("x", lx); alvoTexto.setAttribute("y", ly);
    alvoFundo.setAttribute("x", lx - 6); alvoFundo.setAttribute("y", ly - 15);
    alvoFundo.setAttribute("width", larg + 12); alvoFundo.setAttribute("height", 24);
    alvoLinha.setAttribute("x1", ax); alvoLinha.setAttribute("y1", ay);
    alvoLinha.setAttribute("x2", bx); alvoLinha.setAttribute("y2", by);
  }

  // Mostra a caixa "Por que isso acontece" com a explicação do problema.
  function mostrarDicas(posicao) {
    document.getElementById("dicas-nome").textContent = falhas[posicao].nome;
    document.getElementById("dicas-porque").textContent = dicas[posicao].porque;
    var lista = document.getElementById("dicas-causas");
    lista.innerHTML = "";
    for (var i = 0; i < dicas[posicao].causas.length; i++) {
      lista.innerHTML += "<li>" + dicas[posicao].causas[i] + "</li>";
    }
    document.getElementById("dicas").hidden = false;
  }

  // Tira o destaque e os efeitos do desenho.
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
      document.getElementById("manut-texto").textContent = "Pode fazer a manutenção. Antes de abrir a válvula, espere a aprovação de um responsável.";
    } else {
      document.getElementById("manut-caixa").className = "manut-caixa naoseguro";
      document.getElementById("manut-nome").textContent = "NÃO SEGURO";
      document.getElementById("manut-texto").textContent = "Ainda não. Faça isto antes da manutenção:";
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
    valvula.classList.remove("ligada", "aviso", "atencao");
    limparLocal();
    caixaRelatorio.hidden = true;
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

  // 6) LIGAR CADA BOTÃO À SUA FUNÇÃO
  botaoIniciar.addEventListener("click", iniciar);
  botaoFalha.addEventListener("click", abrirMenu);
  botaoReiniciar.addEventListener("click", reiniciar);
  botaoManutencao.addEventListener("click", verificarManutencao);

  // 7) MONTAR O QUE DEPENDE DAS LISTAS (botões dos problemas)
  montarSubmenu();