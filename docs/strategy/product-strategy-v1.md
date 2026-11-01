# Hotel Engine — Product Strategy v1: de SaaS para OaaS

Data: 2026-11-01. Autor: analise estrategica a partir do codigo, modelo de dados, docs (`CLAUDE.md`, `docs/analysis/*`, `docs/produto-e-roadmap.md`, `docs/milestones.md`) e das pranchas de design.
Status: proposta para decisao do proprietario. Nada aqui foi implementado.

---

## 0. Veredito em uma pagina

**A premissa esta certa pela metade.** O produto deve passar a ser vendido e medido por resultado. Mas um OaaS puro (pagar so pelo resultado) e uma armadilha para este produto, por tres razoes que o codigo e o mercado impoem:

1. **O motor de reservas nao gera demanda; ele converte e protege a demanda que ja existe.** Quem traz o hospede e o Instagram, o Google, a indicacao e, hoje, a OTA. Cobrar so por "mais reservas" e assumir risco sobre uma variavel que nao controlamos.
2. **Atribuicao e o calcanhar de Aquiles de qualquer OaaS.** Hoje o sistema nao sabe de onde veio uma reserva, nao registra eventos e nao tem linha de base. Sem isso, nao ha como provar o outcome nem cobrar por ele.
3. **OaaS sem automacao vira agencia.** Se o resultado depende de gente operando, a margem some com a escala. O unico jeito de OaaS funcionar aqui e com agentes fazendo a operacao, e o harness que ja existe no projeto e exatamente a infraestrutura para isso.

**Direcao recomendada: "Outcome-oriented managed service" sobre o motor atual**, com preco hibrido (base pequena + percentual sobre reservas diretas confirmadas), outcome principal **"reservas diretas confirmadas sem trabalho do dono"**, e evidencia do resultado embutida no produto. O SaaS continua existindo como motor interno; o cliente nao compra "acesso ao sistema", compra "seu WhatsApp atendido em 1 minuto, 24h, com reserva confirmada e paga, e zero comissao de OTA sobre isso".

O que muda de imediato no roadmap: **medicao antes de multi-tenant**, **Pix e WhatsApp automatizado antes de calendario bonito**, e **3 pilotos reais antes de qualquer reescrita**.

---

## 1. O que temos hoje (leitura do sistema)

| Camada | O que existe | Para que serve hoje |
|---|---|---|
| Dominio | `rooms`, `bookings` (pending/approved/cancelled, `no_double_booking`), `blocked_dates`, `booking_policy`, `site_settings`, `gallery_photos`, `admins` | Vender noites de um unico hotel sem overbooking |
| Fluxo | Hospede escolhe datas -> pre-reserva (sem pagamento) -> dono aprova no painel -> WhatsApp manual via `wa.me` | Conversao depende do dono responder; confirmacao e manual |
| Regras | Disponibilidade, preco, minimo de noites e janela de cancelamento no Postgres | Integridade forte; e o ativo tecnico mais valioso |
| Painel | Reservas (realtime), calendario, quartos, galeria, configuracoes do site | Operacao manual; UX de "software para configurar" |
| Site | Home, busca de disponibilidade (M4-02), cancelamento por token | Captura de demanda que ja chegou ao site |
| Plataforma | Next.js 14 + Supabase, RLS, harness de agentes, CI/PR protegido | Base solida e barata; plano multi-tenant desenhado, nao iniciado |
| O que NAO existe | atribuicao de origem, log de eventos, pagamento, mensageria automatica, sync com OTA (iCal), metricas, onboarding assistido | Tudo que seria necessario para provar e entregar um outcome |

Leitura: o sistema e um **bom motor** e um **painel de configuracao**. Nao e, ainda, um produto que entrega resultado sozinho.

---

## 2. As 12 perguntas

### 2.1 Qual e o verdadeiro outcome?
Para a pousada de 6 a 30 unidades, o resultado que vale dinheiro e composto por tres partes, nesta ordem de valor percebido:
1. **Reserva direta confirmada e paga**, sem comissao de OTA (15 a 20% hoje) e sem o dono precisar estar no celular.
2. **Nenhuma reserva perdida**: por demora na resposta, por overbooking, por duvida de disponibilidade nao respondida.
3. **Tempo do dono devolvido**: menos horas por semana atendendo WhatsApp, conferindo agenda e cobrando sinal.

Outcome unico para o posicionamento: **"Suas reservas diretas, confirmadas e pagas, sem voce operar nada."**

### 2.2 Quem paga e qual problema de negocio?
- **Paga**: o proprietario-operador da pousada pequena (ICP abaixo). Decide sozinho, paga do proprio bolso, mede em reais e em horas.
- **Problema**: dependencia de OTA (comissao e perda de relacao com o hospede), operacao 100% manual via WhatsApp, perda de reservas por resposta lenta, no-show sem sinal, medo de overbooking ao vender em varios canais.
- **O que ele compara**: comissao da OTA (custo variavel sem teto) e um funcionario de recepcao (custo fixo alto). Nosso preco precisa ficar entre os dois e ser justificado em reais economizados.

### 2.3 Feature x contribuicao ao resultado
| Contribui para o outcome | Apenas feature (hoje) |
|---|---|
| Motor de disponibilidade sem overbooking | Galeria / Momentos |
| Busca com total no servidor (M4-02) | Tema por tenant, cores, fontes (M3-03) |
| Politicas (minimo de noites, cancelamento) | Dominio proprio cedo (M3-05) |
| Cancelamento por token (reduz trabalho) | Tape chart elaborado (M4-07 como esta) |
| Realtime no painel | Papeis e equipe (M2-08) para quem tem 1 pessoa |
| site_settings como fonte de verdade (necessario, nao diferencial) | Configuracoes extensas no painel |

O painel inteiro e "feature" ate que mostre resultado em vez de configuracao.

### 2.4 Arquitetura pensada para SaaS que vira limitacao
| Decisao atual | Por que limita OaaS | Classe |
|---|---|---|
| Aprovacao manual como passo central | O outcome exige confirmacao automatica sob regras (sinal pago => confirmada) | produto + arquitetura |
| Nenhuma tabela de eventos nem origem da reserva | Impossivel medir, atribuir e cobrar por resultado | arquitetura |
| WhatsApp so por `wa.me` (link que abre o app do dono) | O sistema nao consegue responder, lembrar ou cobrar sozinho | arquitetura |
| Sem pagamento | Sem sinal nao ha confirmacao automatica nem reducao de no-show | arquitetura + negocio |
| `site_settings` como "configure voce mesmo" | OaaS implica onboarding feito pelo sistema/agente, nao formulario longo | produto |
| Multi-tenant como proxima grande fase (M2) | Correto para escala de SaaS; prematuro antes de validar o outcome com 3 clientes | arquitetura + negocio |
| Sem sync com OTA (iCal) | Overbooking entre canais e o medo numero 1; sem isso o cliente nao larga a OTA | arquitetura |

O que **nao** limita e deve ser preservado: regras no Postgres, RLS, service role so no servidor, harness de agentes, CI e protecao de branch. Isso e o que permite automatizar com seguranca.

### 2.5 O que muda na experiencia para o cliente comprar resultado
- **Onboarding em 20 minutos, feito por nos (ou por um agente)**: o dono manda o link do Booking/Instagram e as fotos; o site e os quartos nascem prontos. Nada de preencher 30 campos.
- **A tela inicial do painel vira um relatorio de resultado**: reservas diretas no mes, comissao economizada em R$, tempo medio de resposta, no-shows evitados por sinal, ocupacao. Configuracoes ficam em segundo plano.
- **O dono so aparece para excecoes**: pedido fora de regra, cancelamento tardio, hospede pedindo desconto. O resto o sistema resolve e avisa.
- **Relatorio semanal no WhatsApp do dono**: "Esta semana: 6 reservas diretas, R$ 1.840 em comissao economizada, 100% respondidas em menos de 1 minuto."
- **Promessa explicita e mensuravel** na proposta comercial, com garantia de saida.

### 2.6 O que automatizar (agentes como operacao, nao como feature)
1. **Concierge de reservas no WhatsApp** (inbound): responde disponibilidade e preco, manda link de reserva com datas preenchidas, retoma pre-reserva abandonada. Hoje isso e o dono, a noite, no celular.
2. **Confirmacao automatica**: regra "sinal pago via Pix => aprovada"; sem sinal em X horas => lembrete; depois => libera a data.
3. **Lembretes e pos-estadia**: 48h antes, instrucoes de chegada; depois, pedido de avaliacao e cupom para reserva direta futura.
4. **Sincronizacao de calendario com OTAs (iCal)**: importa bloqueios da OTA, exporta os nossos. Elimina o overbooking entre canais sem channel manager caro.
5. **Onboarding assistido**: agente le a pagina da OTA/Instagram, propoe quartos, textos e politicas; humano aprova.
6. **Relatorio de resultado**: gerado e enviado pelo sistema, com os numeros das metricas abaixo.
7. **Sugestao de preco por periodo** (depois): feriados, fim de semana, ocupacao; o dono aprova com um toque.

### 2.6b O concierge como vendedor: capacidades, limites e linguagem

O concierge nao e um chatbot de FAQ. E o vendedor entre o primeiro "tem vaga?" e o Pix pago. Seu poder de conversao vem de quatro coisas mensuraveis, nao de "persuasao":
1. **Velocidade**: responde em menos de 1 minuto, 24h. Em reserva direta, quem responde primeiro fecha.
2. **Encaixe**: le a intencao ("casal, aniversario, 2 noites") e oferece o quarto certo com o argumento certo, em vez da lista.
3. **Remocao de atrito**: link ja com datas, Pix em dois toques, objecoes respondidas na hora.
4. **Acompanhamento**: follow-up em 2h e em 20h com motivo legitimo ("seguro a data ate amanha"), que o dono nao faz.

| Capacidade | Como | Fonte da verdade |
|---|---|---|
| Mostrar fotos do quarto | envia 2-3 imagens do quarto com legenda pela API | `rooms.images` (Storage) |
| Tirar duvidas | cafe, pet, estacionamento, horarios | `site_settings`, `booking_policy`, `rooms.amenities`, `hotel_faq` (novo) |
| Dicas locais por epoca e origem | clima, eventos, feriados, como chegar | `local_tips` (novo: mes/evento/origem -> dica) |
| Vender | sugere quarto por perfil; escassez e ancoragem so quando verdadeiras | motor de disponibilidade, regras comerciais |
| Acompanhar ate o pagamento | estado do funil por conversa; lembretes; liberacao de data | `conversations`/`messages` (novo) + jobs |
| Negociar dentro de regras | desconto, upsell, minimo de noites | `commercial_rules` (novo), definidas pelo dono; fora delas, escala |

**Tres condicoes de desenho (regras, nao opcoes):**
- **Todo fato vem do banco.** Preco, disponibilidade, politica, foto, avaliacao, comodidade. O modelo so redige. O que nao existe cadastrado vira "vou confirmar com a pousada" e escala. Escassez ou prova social inventada e proibida por regra e pela lei do consumidor.
- **Memoria e estagio do funil.** curioso -> datas -> quarto -> link enviado -> pago -> hospedado. Follow-ups sao regras por estagio.
- **Escalacao sem friccao.** Fora do roteiro (reclamacao, grupo grande, pergunta sem resposta cadastrada) vai ao dono com contexto resumido e botoes; o hospede nunca fica sem resposta.

**Regras de linguagem (produto, nao detalhe):**
1. Palavras do hospede, nao do setor: "Booking" e "Airbnb", nunca "OTA"; "horario de entrada", nao "check-in time"; "sinal", nao "deposit"; "epoca de feriado", nao "alta temporada".
2. Mensagens curtas, uma informacao por vez, numeros redondos. E WhatsApp, nao site.
3. Regionalizar pelo que da para inferir: DDD do telefone, cidade citada, idioma da mensagem. Ajusta saudacao, distancia e jeito de chegar ("de Curitiba sao umas 2h30 de carro"), o que destacar (praia para quem vem do interior, sossego para quem vem da capital).
4. Responde no idioma da mensagem. No litoral de SC, espanhol para argentinos e uruguaios e conversao, nao luxo.
5. Sazonalidade concreta: "em janeiro a cidade enche e os quartos acabam cedo", nao "alta temporada".
6. Tom por hotel escolhido no onboarding (acolhedor, direto, descontraido), mantido em toda a conversa.
7. Glossario proibido no prompt (OTA, tenant, policy, check-in/out em ingles, deposit).

Exemplo: em vez de "no site R$ 760; nas OTAs esse quarto sai mais caro", o agente diz: "Reservando aqui direto fica R$ 760 as duas noites. No Booking o mesmo quarto esta saindo mais caro, e aqui voce ja fala com a gente."

**Como o poder de venda cresce:** roteiros por estagio com variacoes testadas (qual converte mais por perfil e epoca); toda pergunta sem resposta vira item do `hotel_faq`; dados do proprio hotel (ocupacao, sazonalidade) orientam qual quarto sugerir. Metrica: conversas -> link enviado -> Pix gerado -> pago, por idioma e por DDD, com tempo de resposta ao lado. Referencia de mercado: consulta respondida em minutos converte na faixa de 20-40%; em horas, menos da metade. O piloto mede isso por pousada contra a linha de base.

### 2.7 Metricas que provam o outcome
| Metrica | Definicao | Fonte |
|---|---|---|
| Reservas diretas confirmadas / mes | `bookings` approved com origem = direta | atribuicao + eventos |
| Comissao economizada (R$) | soma(valor das diretas) x comissao OTA de referencia do cliente | config por cliente |
| Tempo de primeira resposta | mediana entre mensagem do hospede e resposta do sistema | log de mensagens |
| Conversao | visitas -> busca -> pre-reserva -> confirmada | eventos |
| No-show e cancelamento tardio | % sobre confirmadas, antes e depois do sinal | `bookings` + pagamentos |
| Incidentes de overbooking | contagem (meta zero), incluindo entre canais | constraint + iCal |
| Horas devolvidas ao dono | estimativa: mensagens atendidas pelo sistema x tempo medio | log de mensagens |
| Linha de base | os mesmos numeros nos 30 dias antes de comecar | coletada no onboarding |

Sem linha de base nao existe outcome, so numero bonito. A coleta da linha de base e parte do onboarding.

### 2.8 Modelo comercial
Opcoes e julgamento:
- **Assinatura pura**: previsivel, mas nao alinha incentivo; e o modelo atual implicito. Rejeitar como modelo principal.
- **Pagamento por resultado puro** (% sobre reservas diretas): alinha incentivo, mas transfere para nos o risco da demanda e abre disputa de atribuicao ("essa reserva viria de qualquer jeito"). Rejeitar como modelo unico.
- **Hibrido (recomendado)**: taxa base pequena por unidade (cobre infraestrutura e operacao) + percentual sobre reservas diretas confirmadas (bem abaixo da OTA, ex.: 5 a 8%), com **garantia**: nos primeiros 60 dias, se nao houver reserva direta confirmada, o cliente nao paga o variavel e pode sair.
- **Tiers** por numero de unidades e por nivel de automacao (concierge 24h, pagamentos, sync de OTAs), nao por "features do painel".
- **Setup/onboarding** cobrado ou gratuito como isca, dependendo do piloto.

Ancoragem: o preco se explica em uma frase: "voce paga de 5 a 8% so sobre o que vender direto, em vez de 15 a 20% para a OTA, e nao atende mais WhatsApp de madrugada".

### 2.9 Funcionalidades: manter, modificar, remover, rebaixar
| Acao | Item | Motivo |
|---|---|---|
| Manter | motor de disponibilidade, politicas no Postgres, busca M4-02, cancelamento por token, RLS, harness | nucleo do resultado e da seguranca |
| Modificar | aprovacao -> regras de confirmacao automatica com excecao humana | passo central do outcome |
| Modificar | painel -> tela inicial de resultado; configuracoes em segundo plano | o cliente compra numero, nao formulario |
| Modificar | WhatsApp `wa.me` -> mensageria automatizada (API) com fallback manual | sem isso nao ha concierge |
| Modificar | `site_settings` -> preenchido por onboarding assistido | reduz atrito e tempo ate o primeiro resultado |
| Rebaixar | tema/cores por tenant (M3-03), dominio proprio (M3-05), tape chart rico (M4-07), equipe/papeis (M2-08), painel Hoje elaborado (M4-08) | nao movem o outcome nos primeiros clientes |
| Rebaixar | multi-tenant completo (M2) | adiar ate 5 a 10 clientes; antes, 1 projeto por piloto |
| Remover | Momentos/galeria como feature destacada | vira "fotos do hotel" dentro do onboarding |

### 2.10 Novas capacidades necessarias
1. **Log de eventos e atribuicao de origem** (`booking_events`, `source`): fundacao de tudo.
2. **Pagamento de sinal via Pix** (gateway) com confirmacao automatica.
3. **Mensageria WhatsApp automatizada** (API oficial via provedor) com modelos aprovados e fallback humano.
4. **Sync iCal** bidirecional com Booking/Airbnb.
5. **Motor de regras de confirmacao** (quando aprovar sozinho, quando chamar o dono).
6. **Relatorio de resultado** (semanal e mensal) e linha de base.
7. **Onboarding assistido por agente** (importa OTA/Instagram -> proposta de quartos e textos, guia de estilo e `local_tips`).
8. **Base de conhecimento do concierge**: `hotel_faq`, `local_tips` (mes/evento/origem), `commercial_rules`, guia de estilo por hotel; `conversations`/`messages` com estagio do funil; envio de midia pela API.
9. Depois: sugestao de preco, recuperacao de pre-reserva abandonada, avaliacoes.

### 2.11 Como IA/agentes entregam o outcome
O harness do projeto ja define o padrao: agentes com poderes limitados, regras no banco, humano em excecao. Aplicado ao produto:
- **Agente concierge** (runtime): le mensagem do hospede, consulta disponibilidade pela rota publica, responde com preco e link. Nunca cria reserva sozinho; quem cria e o fluxo com sinal. Nunca inventa preco: so o que a rota devolve.
- **Agente de operacao**: aplica regras de confirmacao, dispara lembretes, libera datas, escala excecoes ao dono.
- **Agente de onboarding** (assistido): propoe conteudo; humano aprova.
- **Agente de relatorio**: calcula e redige o resumo semanal a partir dos eventos.
Limites iguais aos do harness: dados de hospede so no banco, nunca em prompt de terceiros sem necessidade; logs sem PII; toda acao com evento registrado.

### 2.12 Menor MVP de OaaS validavel antes de reescrever
**"Concierge de reservas diretas" para 3 pousadas, em 6 a 8 semanas, sem multi-tenant.**
- Infra: um projeto Supabase e um deploy por piloto (instancia por cliente e mais barato que multi-tenant para 3 clientes; revisao da decisao D6 so para o piloto).
- Construir: `booking_events` + `source`; Pix de sinal por link (gateway em modo simples) com regra "pago => confirmada"; concierge no WhatsApp com fotos, FAQ, dicas locais e regras comerciais (comeca semi-automatico: agente redige, humano envia; depois API), seguindo as regras de linguagem da secao 2.6b; `conversations`/`messages` com estagio do funil; relatorio semanal; linha de base e guia de estilo coletados no onboarding.
- Nao construir: tema, dominio, equipe, tape chart, multi-tenant, testes A/B de roteiro (so depois de ter volume).
- Comercial: 60 dias, base simbolica ou zero, variavel de 5% sobre diretas confirmadas, garantia de saida. Objetivo: provar atribuicao, medir tempo de resposta e conversao por estagio, descobrir o que o dono realmente aprova e o que delega, e quais perguntas o concierge nao soube responder.
- Criterio de sucesso do MVP: pelo menos 2 dos 3 pilotos com reservas diretas confirmadas e pagas atribuidas ao sistema; tempo de 1a resposta < 2 min; conversao conversa -> pago medida e acima da linha de base; zero overbooking; taxa de escalacao ao dono caindo semana a semana; dono disposto a pagar o variavel.

---

## 3. Reaproveitar, adaptar, remover, faltando

| Reaproveitar (como esta) | Adaptar | Remover/rebaixar | Faltando |
|---|---|---|---|
| Schema de reservas e constraint | Fluxo de aprovacao (regras) | Galeria/Momentos como feature | Eventos e atribuicao |
| Politicas no Postgres | Painel (resultado primeiro) | Tema e dominio por tenant | Pagamento Pix |
| Busca de disponibilidade | `site_settings` (onboarding assistido) | Tape chart elaborado | Mensageria automatizada |
| Cancelamento por token | Mensagens de WhatsApp (templates -> API) | Multi-tenant agora | Sync iCal |
| RLS, service role, hooks, CI | `/smoke-test` -> inclui fluxo com sinal | Papeis/equipe | Relatorio e linha de base |
| Pranchas de design (como referencia de UI) | Painel Reservas (excecoes, nao fila) | | Onboarding assistido |

---

## 4. Classificacao das decisoes

| Tipo | Decisoes |
|---|---|
| **Negocio** | ICP (pousada 6-30 unidades, Brasil, dependente de OTA); modelo hibrido com garantia; selecao e termos dos 3 pilotos; comissao de referencia para calcular economia; se o onboarding e cobrado |
| **Produto** | outcome principal; painel de resultado; dono so em excecoes; onboarding assistido; o que sai do roadmap (tema, dominio, equipe, tape chart) |
| **Arquitetura** | `booking_events` e `source`; motor de regras de confirmacao; integracao de pagamento; mensageria via API; iCal; instancia por piloto agora e multi-tenant depois; onde os agentes rodam e com que poderes |

---

## 5. Product Strategy v1 (proposta)

**Posicionamento**: "Hotel Engine confirma e paga suas reservas diretas, 24 horas, sem comissao de OTA e sem voce operar nada."

**Outcome principal**: reservas diretas confirmadas e pagas, atribuidas ao sistema, com tempo de resposta inferior a 2 minutos e zero overbooking. Outcomes secundarios: comissao economizada em R$; horas devolvidas ao dono; no-show reduzido pelo sinal.

**ICP**: proprietario-operador de pousada/residencial/hotel de 6 a 30 unidades no Brasil, que vende pela OTA e pelo WhatsApp, sem recepcao 24h, que perde reserva por demora e paga 15-20% de comissao. Nao-ICP nos primeiros 12 meses: redes, hoteis com PMS instalado, hostels de alto volume.

**Modelo de entrega**: managed service orientado a resultado. Onboarding feito por nos/agente; operacao automatizada; dono em excecoes; relatorio semanal. Preco hibrido: base por unidade + 5-8% sobre diretas confirmadas; garantia de 60 dias.

**Metricas de sucesso** (por cliente e agregadas): diretas confirmadas/mes; comissao economizada; tempo de 1a resposta; conversao; no-show; overbooking (0); horas devolvidas; NPS do dono. Metrica de negocio: receita variavel por cliente vs custo de operacao por cliente (a razao tem que subir com automacao).

**Arquitetura conceitual**:
```
Demanda (OTA, Instagram, Google, indicacao)
   -> Site + Busca (existe)  -> Pre-reserva  -> Regras de confirmacao (novo)
   -> Concierge WhatsApp (novo, agente)  ---^              |
   -> Pagamento Pix (novo) --------------------------------+--> Reserva confirmada
Motor: disponibilidade + politicas no Postgres (existe) + iCal sync (novo)
Evidencia: booking_events + source (novo) -> relatorio semanal (novo) -> painel de resultado (adaptado)
Operacao: agentes com poderes limitados (padrao do harness), humano em excecao
```

**Roadmap de transicao** (substitui a ordem atual dos milestones; o conteudo tecnico e reaproveitado):
| Fase | Duracao | Entregas | Resultado esperado |
|---|---|---|---|
| T0 Medicao | 2 semanas | `booking_events`, `source`, linha de base, relatorio v0; selecao de 3 pilotos e termos | sabemos medir |
| T1 Concierge MVP | 4-6 semanas | Pix de sinal + regra de confirmacao; WhatsApp semi-automatico -> API; lembretes; painel de resultado v0; onboarding manual assistido | 3 pilotos com diretas confirmadas e pagas |
| T2 Prova e preco | 4 semanas | iCal sync; relatorio mensal; ajuste do modelo comercial com dados; decisao go/no-go | 2 de 3 pilotos pagando o variavel |
| T3 Produtizar | 8+ semanas | multi-tenant (M2 reaproveitado), onboarding por agente, tarifacao por periodo, segundo lote de clientes | operacao por cliente cai; margem sobe |

**O que fica do roadmap atual**: E0-B1 (upgrade Next, por seguranca), M1-12 (sw.js), M4-06 reduzido (reservas como fila de excecoes + eventos), E6-A (producao segura: rate limit, headers, keep-alive, dump). O resto e reordenado ou rebaixado conforme a secao 2.9.

**Riscos e como testamos cedo**: atribuicao contestada (T0 resolve com eventos e baseline); dono que nao quer automacao (T1 mede o que ele delega); WhatsApp API com custo e aprovacao de templates (T1 comeca semi-automatico); demanda insuficiente no piloto (selecao de pilotos com trafego existente); virar agencia (meta explicita: horas de operacao humana por cliente caindo a cada fase).

---

## 5b. Modelo de operacao (como roda numa pousada real)

**Semana 0, implantacao (~4h do operador):** reuniao de 30 min com o dono (links do Booking/Instagram, fotos, politicas, numero do WhatsApp) e coleta da linha de base (30 dias: reservas, origem, comissao paga, mensagens/dia); agente de onboarding propoe quartos, textos, politicas, guia de estilo e `local_tips`, humano aprova; projeto Supabase e deploy do piloto; Pix e regra de confirmacao; iCal da OTA importado; WhatsApp conectado (semi-automatico no inicio); dono recebe o PWA e 15 min de treino ("voce so entra para excecoes e para ver o relatorio"); go-live com link do site no Instagram e no Google. A OTA continua ligada.

**Dia tipico:** 21h40 hospede pergunta no WhatsApp; 40 s depois o concierge responde com quarto, preco total, foto e link com datas; 21h52 Pix pago, regra aprova, datas bloqueadas, bloqueio exportado via iCal, hospede recebe confirmacao; evento registrado (origem, tempo de resposta, sinal). O dono ve de manha: "1 reserva direta ontem a noite, R$ 760, comissao economizada R$ 114". Ele e acionado so em excecoes (desconto fora de regra, grupo acima da capacidade, cancelamento tardio, sinal nao pago apos lembrete), sempre com contexto curto e botoes.

**Semana:** segunda de manha o dono recebe o relatorio: diretas, R$ economizados, mensagens atendidas e tempo medio, no-shows evitados, overbooking (0), ocupacao.

**Onde roda:** site/painel/rotas na Vercel (projeto por piloto); motor, politicas e eventos no Supabase (projeto por piloto); concierge em funcao serverless acionada pelo webhook do provedor de WhatsApp (ou na maquina do operador na fase semi-automatica); regras de confirmacao, lembretes, liberacao de datas e iCal em jobs agendados (codigo deterministico); relatorio por job + agente redator; pagamento via gateway com webhook idempotente. **IA so onde ha linguagem**; confirmar, bloquear, liberar e cobrar sao regras e jobs.

**Rotina do operador (voce):** diaria, 10 min: excecoes pendentes, falhas de webhook, perguntas que o concierge nao soube responder (viram FAQ ou regra); semanal, 1h: ler os relatorios antes de irem ao dono, conferir atribuicao, ajustar regras e roteiros; mensal: fechamento do variavel a partir de `booking_events`, 20 min com cada dono, escolher a proxima automacao. Metrica do operador: **horas por cliente por semana**; se nao cair mes a mes, virou agencia.

## 6. Decisoes que so o proprietario pode tomar agora
1. Aceita o modelo **hibrido** em vez de OaaS puro, com a garantia de 60 dias?
2. Autoriza **instancia por piloto** (1 projeto Supabase + 1 deploy por cliente) por 3 meses, adiando o multi-tenant (reabre D6 so para a fase de piloto)?
3. Quais **3 pousadas** entram no piloto e quem faz a conversa comercial?
4. Qual **gateway de Pix** para o piloto (D7 antecipada; Mercado Pago cobre link de pagamento sem integracao pesada)?
5. WhatsApp comeca **semi-automatico** (agente redige, humano envia) ou ja via API oficial?
Com essas cinco respostas, o `milestones.md` e reescrito em torno de T0-T3 e a proxima entrega e a T0 (medicao), nao a E4-B.