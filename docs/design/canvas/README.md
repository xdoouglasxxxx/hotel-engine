# Design de referencia — Hotel Engine

Camada: Conhecimento (ver `docs/harness.md`). Define COMO as telas devem ficar; o codigo segue estas pranchas.

- Canvas editavel (fonte da verdade visual): link do artifact "Hotel Engine — UI (site e painel)" no claude.ai, mantido pelo proprietario.
- `canvas/`: fonte das pranchas (`*.dc.html` + `canvas.json`) exportada em 2026-10-30. Versionada para historico e diff; renderiza so no editor do canvas, nao abrir como pagina.
- `exports/`: PNG/PDF de cada prancha, exportados do canvas, organizados por epico (`exports/README.md`). E o que o Claude Code e o revisor usam como criterio visual de pronto.

## Pranchas

| Arquivo | Tela | Superficie | Tamanho |
|---|---|---|---|
| Main.dc.html | Home | Site publico (mobile) | 390 px |
| Site-Busca.dc.html | Disponibilidade e calendario | Site publico (mobile) | 390 px |
| Site-Reserva.dc.html | Reserva em 3 passos | Site publico (mobile) | 390 px |
| Site-MinhaReserva.dc.html | Minha reserva (status, mensagens, cancelar) | Site publico (mobile) | 390 px |
| Painel-Hoje.dc.html | Hoje: KPIs, chegadas/saidas, aprovacoes, inbox | Painel (desktop) | 1440 px |
| Painel-Calendario.dc.html | Tape chart, tarifas por dia, bloqueios | Painel (desktop) | 1440 px |
| Painel-Reservas.dc.html | Lista + gaveta de detalhe | Painel (desktop) | 1440 px |
| Painel-Config.dc.html | Configuracoes do hotel (site_settings, politicas, pagamentos, equipe) | Painel (desktop) | 1440 px |

## Decisoes de design (2026-10-30)
- Tema escuro em ambas as superficies; fonte Inter; acento teal `#2BB7A5` (tweak por tenant: teal, azul, ambar, lilas).
- Tudo configuravel por tenant aparece entre colchetes `[ ]` nas pranchas e vem de `site_settings` (epico E1).
- Dados de pessoas nas pranchas sao placeholders (`[Hospede A]`); nunca dados reais.
- Preco, noites e disponibilidade exibidos como vindos do servidor; a UI nao calcula.

## Como usar numa tarefa
No prompt da tarefa (sete blocos), em "Contexto obrigatorio": `docs/design/exports/<pasta-do-epico>/<tela>.png` e a linha desta tabela.
Em "Pronto quando": "a tela em localhost reproduz a prancha <tela> (estrutura, hierarquia e estados); diferencas listadas no relato".
Mudanca no design: primeiro no canvas, depois exportar de novo para `exports/` e atualizar `canvas/`.
