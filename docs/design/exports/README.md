# Exports das pranchas

PNG de cada prancha, exportado do canvas (fonte em `../canvas/`). E o que o Claude Code e o
`revisor` usam como criterio visual de pronto (`docs/harness.md`, contrato de pronto).

Organizacao: uma pasta por epico do roadmap (`docs/produto-e-roadmap.md`, secao 2), na ordem em
que o desenvolvimento acontece. Cada prancha fica na pasta do epico que a introduz; um epico
posterior que altera uma tela ja existente recebe uma **variante** com sufixo, nunca uma copia.
Nome do arquivo = nome da prancha no canvas, sem `.dc.html`, com `.png`.

```
exports/
  README.md                       este indice
  hotel-engine-ui.pdf             conjunto completo em PDF (todas as pranchas)
  01-e1-config-site/              E1 - Configuracao do site por tenant
    Painel-Config.png
    Main.png
  02-e3-tema-tenant/              E3 - Roteamento e tema por tenant
    Main-tema-teal.png            variantes de Main com o acento por tenant
    Main-tema-azul.png
    Main-tema-ambar.png
    Main-tema-lilas.png
  03-e4-reserva/                  E4 - Reserva completa
    Site-Busca.png
    Site-Reserva.png
    Site-MinhaReserva.png
    Painel-Reservas.png
    Painel-Calendario.png
    Painel-Hoje.png
  04-e5-onboarding/               E5 - Onboarding e operacao do tenant
    Painel-Config-Equipe.png      secao Equipe da tela de configuracoes
    Painel-Config-Plano.png       secao Plano/billing da tela de configuracoes
```

| Pasta | Epico | Pranchas | Superficie / largura |
|---|---|---|---|
| `01-e1-config-site/` | E1 | `Painel-Config.png`, `Main.png` | painel 1440 px; site 390 px |
| `02-e3-tema-tenant/` | E3 | `Main-tema-<acento>.png` (teal, azul, ambar, lilas) | site 390 px |
| `03-e4-reserva/` | E4 | `Site-Busca.png`, `Site-Reserva.png`, `Site-MinhaReserva.png`, `Painel-Reservas.png`, `Painel-Calendario.png`, `Painel-Hoje.png` | site 390 px; painel 1440 px |
| `04-e5-onboarding/` | E5 | `Painel-Config-Equipe.png`, `Painel-Config-Plano.png` | painel 1440 px |

Observacoes:
- `Painel-Hoje`, `Painel-Calendario` e `Site-Busca` nao estao nas linhas "Pranchas:" do roadmap; foram
  alocadas em E4 por serem telas do fluxo de reserva/operacao [INFERIDO]. Mover se o roadmap decidir diferente.
- E0, E2 e E6 nao tem prancha (hardening, dado, producao).
- Mudou o design: primeiro no canvas, depois exportar de novo para a pasta certa e atualizar `../canvas/`.
- Exportar em escala 2x (390 px -> 780 px; 1440 px -> 2880 px) para o revisor ler texto pequeno.
- Nunca incluir dados reais de pessoas nas pranchas; so placeholders (`[Hospede A]`).
- Os `.gitkeep` existem so para versionar as pastas vazias; podem ser removidos quando o PNG entrar.
