
# 🚀 Projeto Final | Processo Seletivo 26.2 - IbmecJr x Visagio

Bem-vindo ao repositório oficial da área de **Produtos e Inovações** do Projeto Final do Processo Seletivo 26.2 da **IbmecJr. Soluções** em parceria com o **Grupo Visagio**.

Este espaço documenta a concepção, o desenvolvimento e a prototipagem do **InspectAI**, nossa solução baseada em Inteligência Artificial aplicada ao setor de Óleo e Gás.

---

## 📌 Sobre o Projeto
O desafio consiste em investigar uma empresa fictícia de médio porte prestadora de serviços técnicos especializados e manutenção industrial para o setor de Óleo e Gás, identificar dores operacionais e conceber um produto inovador baseado em IA com alto potencial de comercialização e escalabilidade no mercado.

---

## 💡 O Papel da Área de Produtos e Inovações
Como líder do ecossistema de criação da miniempresa, a nossa área foi responsável por:
1. **Identificação do Problema:** Diagnóstico de oportunidades de negócio a partir do cenário operacional do case.
2. **Proposta de Valor & Persona:** Definição clara da proposta de valor, público-alvo e diferenciais competitivos.
3. **Escopo e Lógica de Funcionamento:** Arquitetura conceitual do produto e mapeamento de funcionalidades.
4. **Prototipagem Demonstrativa:** Desenvolvimento de simulações, fluxos e telas demonstrativas para ilustrar a experiência de uso.
5. **Integração Interdepartamental:** Alinhamento contínuo com as áreas de Marketing, Vendas, Processos, Financeiro, Jurídico e Gestão de Pessoas para garantir uma solução coesa e viável.

---

## 📂 Estrutura do Repositório
```text
├── .vscode/
│   └── settings.json
├── assets/                                  # Pasta reservada para recursos compartilhados
│   └── .gitkeep
├── docs/                                    # Pasta reservada para documentação complementar
│   └── .gitkeep
├── Pagina-Apresentacao/
│   ├── fonts/                               # Fontes Manrope, Montserrat e Poppins
│   ├── img/                                 # Logos, favicon e ilustrações da apresentação
│   ├── index.html                           # Página inicial e apresentação dos projetos
│   ├── sobre.html                           # Página institucional
│   ├── contato.html                         # Página de contato
│   └── style.css                            # Estilos das páginas de apresentação
├── Protótipo-Máquina-Centrífuga-API610/
│   ├── inicio.html                          # Interface do simulador de bomba centrífuga
│   ├── style.css
│   ├── script.js
│   ├── Petrovicsemfundo-logo.png
│   └── engrenagem.png
├── prototipo-valvula-choke/
│   ├── index.html                           # Interface do simulador da válvula choke
│   ├── style.css
│   ├── script.js
│   ├── Petrovicsemfundo-logo.png
│   └── engrenagem.png
└── README.md                                # Documentação principal do projeto
```

---

## 🛠️ Detalhes da Solução

### ❗ Problema Identificado
As máquinas das plataformas param **sem aviso**, e a manutenção só acontece **depois da falha**. Além disso, a informação **demora a chegar** nos setores certos, o que aumenta o tempo parado, gera multas contratuais e coloca a equipe em risco.
- Operadoras offshore têm em média **27 dias de parada não planejada por ano**, com custo de cerca de **US$ 38 milhões** (Kimberlite/GE, 2016)
- **48%** dos técnicos perdem 1 h ou mais por turno esperando aprovações (Limble, 2026)

### 🤖 Proposta de Solução (IA)
O **InspectAI** detecta anomalias nos sensores **antes** da falha e organiza automaticamente o que cada setor precisa fazer:
1. 🛢️ **Detecção:** os dados dos sensores (pressão, temperatura, vibração e tensão) saem do SCADA e passam pelo **gateway** na plataforma, que identifica o que está fora do normal
2. 📮 **Envio:** o alerta viaja pelo protocolo **MQTT**, leve e ideal para a internet via satélite
3. 🤖 **Diagnóstico:** o **Agente 1 (ChatGPT)** escreve a causa provável, a ação imediata e a ação preventiva
4. 🧐 **Revisão:** o **Agente 2 (Claude Haiku)**, de outra empresa, revisa o diagnóstico e corrige se precisar
5. 👷 **Validação humana:** o **Controle de Qualidade** confirma o diagnóstico (✅ Validar) ou descarta (❌ Alarme falso)
6. 📣 **Ação:** após a validação, **todos os setores** recebem o alerta **ao mesmo tempo** no Telegram (Jurídico, Equipe Técnica, Estoque, Financeiro, Compras e RH & Escala)
7. 📊 **Registro:** cada alerta é salvo numa planilha com data, hora, sensor, valor e diagnóstico, garantindo **rastreabilidade**

> A IA **aponta onde olhar**, mas **não substitui** o técnico: duas IAs se conferem e um profissional sempre valida.

### 💰 Proposta de Valor
- **Menos paradas:** empresas que monitoram por dados tiveram **5,42%** de tempo parado, contra **8,43%** na manutenção reativa (Kimberlite/GE, 2016)
- **Planejamento:** avisar antes dá tempo de levar peça e técnico até a plataforma
- **Comunicação:** cada setor recebe o alerta no seu grupo, sem depender de repasses
- **Segurança:** alertas 🔴 críticos destacados para ação imediata
- **Acessível para médio porte:** usa o SCADA que já existe e ferramentas de baixo custo (n8n, Telegram e Google Sheets)

### 🖥️ Protótipo
**Arquitetura:**
```text
🛢️ Simulador da bomba (HTML) → 📮 Broker MQTT (HiveMQ) → 📥 n8n → 🤖 Agente 1 → 🧐 Agente 2 → 👷 Controle de Qualidade → ✈️ 7 grupos no Telegram + 📊 Google Sheets
```

| Peça | Ferramenta | Papel |
|---|---|---|
| Máquina simulada | HTML + JavaScript | Gera uma falha aleatória e publica o alerta |
| Envio | MQTT (QoS 1) | Garante que o alerta não se perde no caminho |
| Broker | HiveMQ (público, para testes) | Recebe e entrega as mensagens |
| Automação | n8n | Orquestra todo o fluxo |
| Diagnóstico | OpenAI gpt-5-mini | Escreve o diagnóstico |
| Revisão | Anthropic Claude Haiku 4.5 | Revisa e corrige o diagnóstico |
| Validação e alertas | Telegram (bot + 8 grupos) | Botões do Controle de Qualidade e alertas dos setores |
| Registro | Google Sheets | Histórico de alertas |

**Como testar:**
1. No n8n, abrir o fluxo e clicar em **Execute workflow**
2. Abrir o simulador da bomba no navegador e esperar **"✅ Conectado ao broker"**
3. Clicar em **Iniciar** e depois em **Forçar falha**
4. No grupo do **Controle de Qualidade**, clicar em **✅ Validar**
5. Conferir o alerta nos grupos dos setores e a nova linha na planilha

> ⚠️ No protótipo, as falhas são **simuladas** e o broker é público. Na versão real, os dados vêm do SCADA, o machine learning roda no gateway e o broker é privado, com senha. Tokens e chaves **não** ficam neste repositório.

---

## 👥 Miniempresa e Equipe
Este projeto é fruto da colaboração integrada de 7 áreas de atuação da nossa miniempresa, trabalhando com autonomia, agilidade e alinhamento estratégico para entregar uma solução robusta e pronta para a banca com a Visagio em **29 de outubro de 2026**.

---

<div align="center">
  <sub>Desenvolvido com excelência pela equipe de Produtos e Inovações | IbmecJr x Visagio (2026.2)</sub>
</div>
