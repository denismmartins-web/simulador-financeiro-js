// Busca o formulário no HTML pelo id.
// É nele que o usuário preenche os dados e clica em calcular.
const simulatorForm = document.querySelector("#simulator-form");

// Busca os campos de entrada do formulário.
const initialValueInput = document.querySelector("#initial-value");
const monthlyContributionInput = document.querySelector("#monthly-contribution");
const monthlyRateInput = document.querySelector("#monthly-rate");
const monthsInput = document.querySelector("#months");
const taxModeInput = document.querySelector("#tax-mode");

// Busca os textos auxiliares dos campos.
const annualRateHelperElement = document.querySelector("#annual-rate-helper");
const monthsHelperElement = document.querySelector("#months-helper");
const taxHelperElement = document.querySelector("#tax-helper");

// Busca o botão e a mensagem da API Selic.
const fetchSelicButton = document.querySelector("#fetch-selic-button");
const selicInfoElement = document.querySelector("#selic-info");

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
const taxInfoNoteElement = document.querySelector("#tax-info-note");


// Busca as linhas da tabela de IR para destacar a faixa usada no cálculo.
const taxTableRows = document.querySelectorAll("[data-tax-range]");

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

// Função para formatar percentual no padrão brasileiro.
// Exemplo: 12.5 vira "12,50%".
function formatPercent(value) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

// Função para converter o valor digitado no input em número.
// Se o campo estiver vazio, retorna 0.
function getNumberFromInput(input) {
  return Number(input.value) || 0;
}

// Função que formata uma data no padrão dd/MM/aaaa.
// A API do Banco Central usa esse formato nos filtros de data.
function formatDateToBrazilianPattern(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Função que calcula a taxa anual equivalente com base na taxa mensal.
// Fórmula: (1 + taxa mensal decimal) ^ 12 - 1.
function calculateAnnualEquivalentRate(monthlyRate) {
  const monthlyRateDecimal = monthlyRate / 100;
  const annualRateDecimal = Math.pow(1 + monthlyRateDecimal, 12) - 1;

  return annualRateDecimal * 100;
}

// Função que converte uma taxa anual em taxa mensal equivalente.
// Usamos juros compostos, porque o simulador trabalha com rendimento mês a mês.
// Exemplo: 15% ao ano vira aproximadamente 1,17% ao mês.
function convertAnnualRateToMonthlyRate(annualRate) {
  const annualRateDecimal = annualRate / 100;
  const monthlyRateDecimal = Math.pow(1 + annualRateDecimal, 1 / 12) - 1;

  return monthlyRateDecimal * 100;
}

// Função que atualiza o texto auxiliar da taxa anual equivalente.
// Só mostra algo quando existe uma taxa mensal preenchida.
function updateAnnualRateHelper() {
  const monthlyRate = getNumberFromInput(monthlyRateInput);

  if (monthlyRate <= 0) {
    annualRateHelperElement.textContent = "";
    return;
  }

  const annualRate = calculateAnnualEquivalentRate(monthlyRate);

  annualRateHelperElement.textContent =
    `${formatPercent(annualRate)} ao ano equivalente.`;
}

// Função que transforma meses em texto aproximado de anos.
// Exemplo: 24 vira "2 anos"; 18 vira "1 ano e 6 meses".
function formatMonthsAsYears(months) {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} meses`;
  }

  if (remainingMonths === 0) {
    return years === 1 ? "1 ano" : `${years} anos`;
  }

  const yearText = years === 1 ? "1 ano" : `${years} anos`;
  const monthText = remainingMonths === 1 ? "1 mês" : `${remainingMonths} meses`;

  return `${yearText} e ${monthText}`;
}

// Função que atualiza o texto auxiliar do prazo em meses.
// Função que atualiza o texto auxiliar do prazo em meses.
// Só mostra algo quando existe mês preenchido.
function updateMonthsHelper() {
  const months = getNumberFromInput(monthsInput);

  if (months <= 0) {
    monthsHelperElement.textContent = "";
    return;
  }

  monthsHelperElement.textContent = formatMonthsAsYears(months);
}

// Função que atualiza o texto auxiliar do campo de IR.
// Função que atualiza o texto auxiliar do campo de IR.
// Aqui tratamos o select como uma escolha booleana: com IR ou sem IR.
function updateTaxHelper() {
  const taxMode = taxModeInput.value;
  const isTaxEnabled = taxMode === "with-tax";

  if (isTaxEnabled) {
    taxHelperElement.textContent = "Imposto sobre o rendimento.";
    return;
  }

  taxHelperElement.textContent = "Resultado sem desconto.";
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

// Função que descobre qual linha da tabela de IR deve ser destacada.
// Ela usa a mesma lógica da tabela regressiva.
function getIncomeTaxRangeKey(months) {
  const estimatedDays = months * 30;

  if (estimatedDays <= 180) {
    return "up-to-180";
  }

  if (estimatedDays <= 360) {
    return "up-to-360";
  }

  if (estimatedDays <= 720) {
    return "up-to-720";
  }

  return "above-720";
}

// Função que remove o destaque de todas as linhas da tabela.
function clearTaxTableHighlight() {
  taxTableRows.forEach((row) => {
    row.classList.remove("tax-table__row--active");
  });
}

// Função que destaca a linha da tabela correspondente ao prazo calculado.
function updateTaxTableHighlight(months, taxMode) {
  clearTaxTableHighlight();

  if (taxMode !== "with-tax" || months <= 0) {
    return;
  }

  const activeRange = getIncomeTaxRangeKey(months);
  const activeRow = document.querySelector(`[data-tax-range="${activeRange}"]`);

  if (activeRow) {
    activeRow.classList.add("tax-table__row--active");
  }
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
    resultSummaryElement.textContent =
      `Em ${months} meses (${formatMonthsAsYears(months)}), o valor bruto estimado é ${formatCurrency(simulation.grossFinalValue)}. Após IR estimado de ${formatCurrency(simulation.taxValue)}, o valor líquido seria ${formatCurrency(simulation.netFinalValue)}.`;

    taxInfoNoteElement.innerHTML =
      "<strong>IR:</strong> A alíquota é estimada pela tabela regressiva e incide somente sobre o rendimento bruto.";
  } else {
    resultSummaryElement.textContent =
      `Em ${months} meses (${formatMonthsAsYears(months)}), o valor final estimado é ${formatCurrency(simulation.netFinalValue)}. Nesta simulação, o imposto de renda não foi aplicado.`;

    taxInfoNoteElement.innerHTML =
      "<strong>IR:</strong> nesta opção, o simulador não desconta imposto e mostra o resultado sem tributação.";
  }

  // Destaca na tabela a faixa de IR usada na simulação.
  updateTaxTableHighlight(months, taxMode);

  // Remove a classe hidden para mostrar a área de resultados.
  resultArea.classList.remove("hidden");

}

// Função assíncrona que busca a Meta Selic anual pela API do Banco Central.
// Série 432 = Meta Selic definida pelo Copom.
// O valor vem em % ao ano, então convertemos para % ao mês antes de preencher o campo.
async function fetchLatestSelicMonthlyRate() {
  // Define que estamos buscando os últimos 12 meses.
  // Isso evita pedir uma série histórica grande demais.
  const finalDate = new Date();
  const initialDate = new Date();

  // Volta 12 meses a partir da data atual.
  initialDate.setMonth(initialDate.getMonth() - 12);

  // Formata as datas no padrão usado pela API.
  const startDate = formatDateToBrazilianPattern(initialDate);
  const endDate = formatDateToBrazilianPattern(finalDate);

  // Monta a URL da API.
  // Série 432 = Meta Selic definida pelo Copom, divulgada em % ao ano.
  const apiUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;

  // Altera o visual do botão enquanto busca.
  fetchSelicButton.disabled = true;
  fetchSelicButton.textContent = "Buscando Selic...";
  selicInfoElement.textContent = "Consultando Meta Selic no Banco Central...";

  try {
    // Faz a requisição para a API.
    const response = await fetch(apiUrl);

    // Se a resposta não for boa, gera erro.
    if (!response.ok) {
      throw new Error("Resposta inválida da API.");
    }

    // Converte a resposta em JSON.
    const data = await response.json();

    // Verifica se veio uma lista válida.
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("A API não retornou dados da Meta Selic.");
    }

    // Pega o último registro disponível.
    const latestSelic = data[data.length - 1];

    // Converte o valor anual retornado pela API em número.
    const annualSelicRate = Number(String(latestSelic.valor).replace(",", "."));

    // Verifica se o valor convertido é válido.
    if (Number.isNaN(annualSelicRate)) {
      throw new Error("Valor da Meta Selic não pôde ser convertido.");
    }

    // Converte a taxa anual para taxa mensal equivalente.
    const monthlySelicRate = convertAnnualRateToMonthlyRate(annualSelicRate);

    // Preenche o campo de taxa mensal com a taxa mensal convertida.
    monthlyRateInput.value = monthlySelicRate.toFixed(2);

    // Atualiza o texto da taxa anual equivalente.
    updateAnnualRateHelper();

    // Mostra uma mensagem amigável para o usuário.
    selicInfoElement.textContent =
      `Meta Selic carregada: ${formatPercent(annualSelicRate)} ao ano (${latestSelic.data}). Taxa mensal equivalente: ${formatPercent(monthlySelicRate)}.`;
  } catch (error) {
    // Se algo falhar, mostramos uma mensagem e mantemos o preenchimento manual.
    selicInfoElement.textContent =
      "Não foi possível buscar a Selic agora. Preencha a taxa manualmente.";

    console.error("Erro ao buscar Selic:", error);
  } finally {
    // Independentemente de sucesso ou erro, o botão volta ao normal.
    fetchSelicButton.disabled = false;
    fetchSelicButton.textContent = "Buscar Selic";
  }
}

// Verifica se o botão da API existe antes de adicionar o evento.
if (fetchSelicButton) {
  // Quando clicar no botão, busca a Selic pela API.
  fetchSelicButton.addEventListener("click", fetchLatestSelicMonthlyRate);
}

// Atualiza a taxa anual quando o usuário digita ou muda a taxa mensal.
if (monthlyRateInput) {
  monthlyRateInput.addEventListener("input", updateAnnualRateHelper);
}

// Atualiza a conversão de meses para anos quando o usuário digita o prazo.
if (monthsInput) {
  monthsInput.addEventListener("input", updateMonthsHelper);
}

// Atualiza a explicação de IR quando o usuário muda o tipo de tributação.
if (taxModeInput) {
  taxModeInput.addEventListener("change", updateTaxHelper);
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
      taxTableCardElement.classList.add("hidden");
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

// Atualiza os textos auxiliares assim que a página carrega.
updateAnnualRateHelper();
updateMonthsHelper();
