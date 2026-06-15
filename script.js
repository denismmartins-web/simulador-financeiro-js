// Busca o formulário no HTML pelo id.
// É nele que o usuário preenche os dados e clica em calcular.
const simulatorForm = document.querySelector("#simulator-form");

// Busca os campos de entrada do formulário.
const initialValueInput = document.querySelector("#initial-value");
const monthlyContributionInput = document.querySelector("#monthly-contribution");
const monthlyRateInput = document.querySelector("#monthly-rate");
const monthsInput = document.querySelector("#months");
const taxModeInput = document.querySelector("#tax-mode");

// Busca a área onde os resultados serão exibidos.
const resultArea = document.querySelector("#result-area");

// Busca os elementos específicos onde cada resultado será escrito.
const grossFinalValueElement = document.querySelector("#gross-final-value");
const netFinalValueElement = document.querySelector("#net-final-value");
const totalInvestedElement = document.querySelector("#total-invested");
const grossInterestElement = document.querySelector("#gross-interest");
const taxRateElement = document.querySelector("#tax-rate");
const taxValueElement = document.querySelector("#tax-value");
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
  // Verifica se valor inicial e aporte estão zerados.
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

// Função que descobre a alíquota de IR de acordo com o prazo.
// Para simplificar o estudo, estamos estimando 1 mês como 30 dias.
function getIncomeTaxRate(months) {
  // Converte meses em dias estimados.
  const estimatedDays = months * 30;

  // Até 180 dias: 22,5%.
  if (estimatedDays <= 180) {
    return 22.5;
  }

  // De 181 até 360 dias: 20%.
  if (estimatedDays <= 360) {
    return 20;
  }

  // De 361 até 720 dias: 17,5%.
  if (estimatedDays <= 720) {
    return 17.5;
  }

  // Acima de 720 dias: 15%.
  return 15;
}

// Função principal responsável por calcular a simulação.
// A lógica considera rendimento mês a mês e aporte ao final de cada mês.
function calculateSimulation(
  initialValue,
  monthlyContribution,
  monthlyRate,
  months,
  taxMode
) {
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

  // Calcula o rendimento bruto.
  const grossInterest = balance - totalInvested;

  // Verifica se o usuário escolheu aplicar IR.
  const shouldApplyTax = taxMode === "with-tax";

  // Descobre a alíquota de IR pela tabela regressiva.
  const taxRate = shouldApplyTax ? getIncomeTaxRate(months) : 0;

  // Calcula o imposto somente sobre o rendimento positivo.
  // Se não houve lucro, não aplicamos imposto.
  const taxValue = grossInterest > 0 ? grossInterest * (taxRate / 100) : 0;

  // Calcula o valor final líquido.
  const netFinalValue = balance - taxValue;

  // Retorna os resultados em formato de objeto.
  return {
    grossFinalValue: balance,
    netFinalValue: netFinalValue,
    totalInvested: totalInvested,
    grossInterest: grossInterest,
    taxRate: taxRate,
    taxValue: taxValue,
  };
}

// Função que exibe os resultados na tela.
function showResults(simulation, months, taxMode) {
  // Escreve o valor final bruto formatado.
  grossFinalValueElement.textContent = formatCurrency(simulation.grossFinalValue);

  // Escreve o valor final líquido formatado.
  netFinalValueElement.textContent = formatCurrency(simulation.netFinalValue);

  // Escreve o total investido formatado.
  totalInvestedElement.textContent = formatCurrency(simulation.totalInvested);

  // Escreve o rendimento bruto formatado.
  grossInterestElement.textContent = formatCurrency(simulation.grossInterest);

  // Escreve a alíquota de IR.
  taxRateElement.textContent = `${simulation.taxRate.toFixed(1).replace(".", ",")}%`;

  // Escreve o valor estimado de IR.
  taxValueElement.textContent = formatCurrency(simulation.taxValue);

  // Monta o texto de explicação com base no tipo de tributação.
  if (taxMode === "with-tax") {
    resultSummaryElement.textContent = `Em ${months} meses, o valor bruto estimado é ${formatCurrency(simulation.grossFinalValue)}. Após IR estimado de ${formatCurrency(simulation.taxValue)}, o valor líquido seria ${formatCurrency(simulation.netFinalValue)}.`;
  } else {
    resultSummaryElement.textContent = `Em ${months} meses, o valor final estimado é ${formatCurrency(simulation.netFinalValue)}. Nesta simulação, o imposto de renda não foi aplicado.`;
  }

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
    const taxMode = taxModeInput.value;

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
      months,
      taxMode
    );

    // Exibe os resultados na tela.
    showResults(simulation, months, taxMode);
  });
}
