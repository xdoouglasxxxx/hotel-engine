# docs/analysis — indice

Diagnostico feito em 2026-10-29, antes de qualquer execucao do sistema. Ler so o arquivo que responde a pergunta da tarefa (harness, eixo 2); `02` e `03` sao longos, ler apenas a secao afetada.

| Arquivo | Pergunta que responde | Quando ler |
|---|---|---|
| `00-perguntas-em-aberto.md` | O que ainda nao foi decidido pelo proprietario e por que bloqueia (modelo de tenant, moeda, tarifacao, pagamento, papeis, runtime, historico git)? | Antes de qualquer plano de feature; se a feature toca um item daqui, parar e perguntar. |
| `01-diagnostico-execucao.md` | Por que o sistema nao roda hoje e o que falta para subir (stack, dependencias, nomes das env vars, SQL a aplicar, infra inexistente, plano de reanimacao em 9 passos, definicao do smoke test)? | Reanimacao, `.env.local`, `/smoke-test`, duvidas de versao. §8 ja reflete a decisao de usar projeto dev na nuvem (sem Supabase local). |
| `02-arquitetura.md` | Como o sistema funciona: modulos, fluxo ponta a ponta da reserva, modelo de dados, onde vive cada regra de negocio, auth/autorizacao, integracoes, qualidade e veredito por area? | Antes de editar rota, SQL, cliente Supabase ou componente de reserva; investigacao de bug (secoes 2-5). |
| `03-acoplamento-ao-cliente-atual.md` | Onde o codigo esta amarrado ao cliente anterior (marca, textos, telefone, dominio, dados pessoais mascarados, premissa de hotel unico) e quais sao os 10 acoplamentos mais dificeis? | Ao tocar em componentes publicos, metadata, WhatsApp, manifests; base do `/varrer-acoplamento` e do desenho multi-tenant. |

Regra: estes arquivos descrevem o estado em 2026-10-29. Quando o codigo mudar, atualizar a secao correspondente ou anotar a divergencia na "Pendencias" do relato; nao deixar o doc mentir em silencio.
