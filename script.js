// Busca o formulário no HTML pelo id.
// É nele que o usuário preenche os dados e clica em calcular.
const simulatorForm = document.querySelector("#simulator-form");

// Busca os campos de entrada do formulário.
const initialValueInput = document.querySelector("#initial-value");
const monthlyContributionInput = document.querySelector("#monthly-contribution");
const monthlyRateInput = document.querySelector("#monthly-rate");
const monthsInput = document.querySelector("#months");

// Busca a área onde os resultados serão exibidos.
const resultArea = document.querySelector("#result-area");

// Busca os elementos específicos onde cada resultado será escrito.
const finalValueElement = document.querySelector("#final-value");
const totalInvestedElement = document.querySelector("#total-invested");
const totalInterestElement = document.querySelector("#total-interest");
const resultSummaryElement = document.querySelector("#result-summary");

// Busca o elemento de mensagem de erro.
const errorMessageElement = document.querySelector("#error-message");

// Função para formatar um número como moeda brasileira.
// Exemplo: 1500 vira "R$ 1.500,00".
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Função para converter o valor digitado no input em número.
// Se o campo estiver vazio, retorna 0.
function getNumberFromInput(input) {
  return Number(input.value) || 0;
}

// Função que valida os dados antes de calcular.
// Ela retorna uma mensagem de erro ou uma string vazia se estiver tudo certo.
function validateFields(initialValue, monthlyContribution, monthlyRate, months) {
  // Verifica se todos os valores estão zerados.
  if (initialValue <= 0 && monthlyContribution <= 0) {
    return "Informe um valor inicial ou um aporte mensal maior que zero.";
  }

  // Verifica se a taxa mensal é válida.
  if (monthlyRate < 0) {
    return "A taxa mensal não pode ser negativa.";
  }

  // Verifica se o tempo foi preenchido corretamente.
  if (months <= 0) {
    return "Informe um tempo maior que zero.";
  }

  // Se não tiver erro, retorna texto vazio.
  return "";
}

// Função principal responsável por calcular a simulação.
// A lógica considera que o rendimento acontece mês a mês,
// e o aporte mensal entra ao final de cada mês.
function calculateSimulation(initialValue, monthlyContribution, monthlyRate, months) {
  // Converte a taxa percentual em taxa decimal.
  // Exemplo: 1% vira 0.01.
  const monthlyRateDecimal = monthlyRate / 100;

  // Começa o saldo com o valor inicial informado.
  let balance = initialValue;

  // Repete o cálculo mês a mês.
  for (let month = 1; month <= months; month++) {
    // Primeiro aplica o rendimento do mês.
    balance = balance * (1 + monthlyRateDecimal);

    // Depois adiciona o aporte mensal.
    balance = balance + monthlyContribution;
  }

  // Calcula o total de dinheiro colocado pelo usuário.
  const totalInvested = initialValue + monthlyContribution * months;

  // Calcula quanto veio apenas de rendimento.
  const totalInterest = balance - totalInvested;

  // Retorna os resultados em formato de objeto.
  return {
    finalValue: balance,
    totalInvested: totalInvested,
    totalInterest: totalInterest,
  };
}

// Função que exibe os resultados na tela.
function showResults(finalValue, totalInvested, totalInterest, months) {
  // Escreve o valor final formatado.
  finalValueElement.textContent = formatCurrency(finalValue);

  // Escreve o total investido formatado.
  totalInvestedElement.textContent = formatCurrency(totalInvested);

  // Escreve o rendimento estimado formatado.
  totalInterestElement.textContent = formatCurrency(totalInterest);

  // Escreve uma frase de resumo da simulação.
  resultSummaryElement.textContent = `Em ${months} meses, seu investimento pode chegar a ${formatCurrency(finalValue)}, com rendimento estimado de ${formatCurrency(totalInterest)}.`;

  // Remove a classe hidden para mostrar a área de resultados.
  resultArea.classList.remove("hidden");
}

// Verifica se o formulário existe antes de adicionar o evento.
// Isso evita erro caso o id seja alterado sem querer no HTML.
if (simulatorForm) {
  // Escuta o envio do formulário.
  simulatorForm.addEventListener("submit", (event) => {
    // Impede o recarregamento da página ao clicar no botão.
    event.preventDefault();

    // Pega os valores digitados pelo usuário.
    const initialValue = getNumberFromInput(initialValueInput);
    const monthlyContribution = getNumberFromInput(monthlyContributionInput);
    const monthlyRate = getNumberFromInput(monthlyRateInput);
    const months = getNumberFromInput(monthsInput);

    // Valida os campos antes de calcular.
    const errorMessage = validateFields(
      initialValue,
      monthlyContribution,
      monthlyRate,
      months
    );

    // Se existir mensagem de erro, mostramos na tela e paramos o cálculo.
    if (errorMessage) {
      errorMessageElement.textContent = errorMessage;
      resultArea.classList.add("hidden");
      return;
    }

    // Se não tiver erro, limpamos a mensagem anterior.
    errorMessageElement.textContent = "";

    // Calcula a simulação.
    const simulation = calculateSimulation(
      initialValue,
      monthlyContribution,
      monthlyRate,
      months
    );

    // Exibe os resultados na tela.
    showResults(
      simulation.finalValue,
      simulation.totalInvested,
      simulation.totalInterest,
      months
    );
  });
}
