# Simulador Financeiro JS 💸

Projeto desenvolvido para praticar **HTML, CSS, JavaScript, consumo de API, manipulação do DOM, Git, GitHub e GitHub Pages**.

A aplicação simula o crescimento de um investimento em renda fixa, considerando valor inicial, aporte mensal, taxa mensal, prazo em meses e uma estimativa de Imposto de Renda sobre o rendimento.

## 🔗 Projeto online

Acesse o projeto publicado:

https://denismmartins-web.github.io/simulador-financeiro-js/

## 📌 Objetivo do projeto

O objetivo deste projeto foi criar uma calculadora financeira simples, visual e interativa para praticar conceitos importantes de desenvolvimento web.

Durante o desenvolvimento :

* estruturação com HTML;
* estilização responsiva com CSS;
* lógica de cálculo com JavaScript;
* atualização dinâmica da página usando DOM;
* consumo de API externa;
* publicação com GitHub Pages;
* uso de branch, Pull Request e Squash Merge.

## ⚙️ Funcionalidades

* Simulação de rendimento mês a mês;
* Campo para valor inicial;
* Campo para aporte mensal;
* Campo para taxa mensal usada no cálculo;
* Conversão automática de meses para anos;
* Cálculo de valor final bruto;
* Cálculo de valor final líquido;
* Cálculo de rendimento bruto;
* Estimativa de Imposto de Renda sobre o lucro;
* Tabela regressiva de IR;
* Destaque automático da faixa de IR usada no cálculo;
* Busca da Meta Selic por API externa;
* Conversão da taxa anual da Selic para taxa mensal equivalente;
* Mensagens de validação para campos inválidos;
* Contador visual de acessos da página;
* Layout responsivo para computador e celular.

## 🧠 Principais aprendizados

### HTML

Neste projeto, o HTML foi usado para estruturar a página, separando o conteúdo em seções como:

* apresentação do projeto;
* cards educativos;
* formulário de simulação;
* área de resultados;
* tabela informativa;
* contador de visualizações.

Também foi praticado o uso de `id` e `class`, entendendo que:

* `id` identifica um elemento único, usado principalmente pelo JavaScript;
* `class` pode ser reutilizada em vários elementos, sendo muito usada no CSS.

### CSS

O CSS foi usado para criar a identidade visual do projeto, com:

* fundo em degradê;
* cards com sombra;
* botões com hover;
* campos estilizados;
* layout em grid;
* responsividade com media queries;
* contador fixo com estética de display antigo;
* cards educativos sobre renda fixa.


### JavaScript

O JavaScript foi responsável pela lógica principal do simulador.

Com ele, o projeto realiza:

* leitura dos valores digitados pelo usuário;
* validação dos campos;
* cálculo de juros compostos;
* cálculo de imposto sobre rendimento;
* atualização dos resultados na tela;
* destaque da tabela regressiva de IR;
* busca de dados em API externa;
* alteração do DOM em tempo real.

## 🔄 Manipulação do DOM

Uma parte importante do projeto foi entender a atualização do DOM.

O DOM é a representação viva da página dentro do navegador.
Com JavaScript, foi possível alterar textos, mostrar resultados, remover classes e destacar elementos sem precisar recarregar a página.

Exemplos de atualizações feitas pelo JavaScript:

* mostrar o valor final bruto;
* mostrar o valor final líquido;
* exibir mensagens de erro;
* preencher a taxa mensal após buscar a Selic;
* destacar a faixa correta da tabela de IR;
* atualizar o contador visual da página.

## 🌐 Consumo de API

O projeto utiliza uma API externa para buscar a Meta Selic.

A taxa retornada vem como valor anual. Por isso, o JavaScript converte essa taxa para uma taxa mensal equivalente, usando lógica de juros compostos.

Esse processo ajudou a entender que uma API pode fornecer dados externos para uma página estática, deixando o projeto mais dinâmico mesmo sem backend próprio.

## 💾 LocalStorage e fallback

O projeto também utiliza `localStorage` como apoio para o contador de visualizações.

O contador real depende de uma API externa.
Caso a API falhe, o navegador pode exibir o último valor salvo localmente como uma referência visual.

Isso ajudou a entender a diferença entre:

* DOM: alteração temporária da página aberta;
* localStorage: armazenamento no navegador do usuário;
* API: serviço externo que pode armazenar ou retornar dados globais.

## 🧮 Regras da simulação

A simulação considera:

* valor inicial informado;
* aporte mensal informado;
* taxa mensal;
* prazo em meses;
* rendimento composto mês a mês;
* aporte adicionado ao final de cada mês.

O Imposto de Renda é estimado apenas sobre o rendimento bruto, usando uma tabela regressiva aproximada.

## 📊 Tabela regressiva de IR usada

| Prazo estimado    | Alíquota |
| ----------------- | -------: |
| Até 180 dias      |    22,5% |
| De 181 a 360 dias |      20% |
| De 361 a 720 dias |    17,5% |
| Acima de 720 dias |      15% |

> Observação: este projeto tem finalidade educacional. Os cálculos são estimativas e não representam recomendação financeira.

## 🛠️ Tecnologias utilizadas

* HTML5;
* CSS3;
* JavaScript;
* API externa;
* Git;
* GitHub;
* GitHub Pages.

## 🚀 Publicação

O projeto foi publicado usando GitHub Pages.

Durante o processo, foram praticados conceitos importantes de versionamento:

* criação de branch;
* desenvolvimento separado da branch principal;
* commit das alterações;
* abertura de Pull Request;
* Squash and Merge;
* exclusão da branch após merge;
* atualização da página publicada.

## 📚 O que este projeto demonstra

Este projeto demonstra conhecimentos iniciais em desenvolvimento web front-end, incluindo:

* organização de arquivos;
* estruturação de página;
* estilização visual;
* responsividade;
* lógica de programação;
* manipulação do DOM;
* uso de API;
* tratamento de erro;
* deploy com GitHub Pages;
* fluxo profissional com Git e GitHub.

## 📁 Estrutura do projeto

```txt
simulador-financeiro-js/
├── index.html
├── style.css
├── script.js
└── README.md
```

## ✅ Status do projeto

Projeto concluído como estudo prático de JavaScript, APIs e GitHub Pages.

Futuras melhorias possíveis:

* adicionar gráficos de evolução mensal;
* permitir comparação entre investimentos;
* salvar simulações no navegador;
* adicionar modo claro e escuro;
* melhorar o contador de visualizações;
* transformar a aplicação em um dashboard financeiro maior.

## 👨‍💻 Autor

Desenvolvido por Denis Martins como projeto de estudo e portfólio.
