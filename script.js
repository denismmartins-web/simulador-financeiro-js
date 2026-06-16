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

// Busca o elemento onde o contador de visualizações será exibido.
const viewCounterElement = document.querySelector("#view-counter");

// Busca as linhas da tabela de IR para destacar a faixa usada no cálculo.
const taxTableRows = document.querySelectorAll("[data-tax-range]");

// Busca o elemento de mensagem de erro.
const errorMessageElement = document.querySelector("#error-message");

// Configurações do contador de visualizações.
// namespace = identifica o projeto no serviço da API.
// key = identifica qual contador será incrementado.
const COUNTER_NAMESPACE = "denismmartins-web";
const COUNTER_KEY = "simulador-financeiro-js-page-views";

// Chave usada para guardar o último valor válido no navegador.
// Isso não substitui a API; é apenas um fallback visual se a API falhar.
const LOCAL_COUNTER_CACHE_KEY = "simuladorFinanceiroViewsLastValue";

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

// Função para formatar o número de visualizações no padrão brasileiro.
function formatViewCount(value) {
  return Number(value).toLocaleString("pt-BR");
}

// Função para converter o valor digitado no input em número.
// Se o campo estiver vazio, retorna 0.
function getNumberFromInput(input) {
  return Number(input.value) || 0;
}

// Busca no localStorage o último contador válido salvo neste navegador.
function getLastSavedViewCount() {
  return Number(localStorage.getItem(LOCAL_COUNTER_CACHE_KEY)) || 0;
}

// Salva no localStorage o último contador válido recebido da API.
function saveLastViewCount(value) {
  if (value > 0) {
    localStorage.setItem(LOCAL_COUNTER_CACHE_KEY, String(value));
  }
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
  const estimatedDays = months * 30;

  if (estimatedDays <= 180) {
    return 22.5;
  }

  if (estimatedDays <= 360) {
    return 20;
  }

  if (estimatedDays <= 720) {
    return 17.5;
  }

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
  const monthlyRateDecimal = monthlyRate / 100;

  let balance = initialValue;

  for (let month = 1; month <= months; month++) {
    balance = balance * (1 + monthlyRateDecimal);
    balance = balance + monthlyContribution;
  }

  const totalInvested = initialValue + monthlyContribution * months;
  const grossInterest = balance - totalInvested;
  const shouldApplyTax = taxMode === "with-tax";
  const taxRate = shouldApplyTax ? getIncomeTaxRate(months) : 0;
  const taxValue = grossInterest > 0 ? grossInterest * (taxRate / 100) : 0;
  const netFinalValue = balance - taxValue;

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
  grossFinalValueElement.textContent = formatCurrency(simulation.grossFinalValue);
  netFinalValueElement.textContent = formatCurrency(simulation.netFinalValue);
  totalInvestedElement.textContent = formatCurrency(simulation.totalInvested);
  grossInterestElement.textContent = formatCurrency(simulation.grossInterest);

  taxRateElement.textContent =
    `${simulation.taxRate.toFixed(1).replace(".", ",")}%`;

  taxValueElement.textContent = formatCurrency(simulation.taxValue);

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

  updateTaxTableHighlight(months, taxMode);
  resultArea.classList.remove("hidden");
}

// Função assíncrona que busca a Meta Selic anual pela API do Banco Central.
// Série 432 = Meta Selic definida pelo Copom.
// O valor vem em % ao ano, então convertemos para % ao mês antes de preencher o campo.
async function fetchLatestSelicMonthlyRate() {
  const finalDate = new Date();
  const initialDate = new Date();

  initialDate.setMonth(initialDate.getMonth() - 12);

  const startDate = formatDateToBrazilianPattern(initialDate);
  const endDate = formatDateToBrazilianPattern(finalDate);

  const apiUrl =
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;

  fetchSelicButton.disabled = true;
  fetchSelicButton.textContent = "Buscando Selic...";
  selicInfoElement.textContent = "Consultando Meta Selic no Banco Central...";

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Resposta inválida da API.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("A API não retornou dados da Meta Selic.");
    }

    const latestSelic = data[data.length - 1];
    const annualSelicRate = Number(String(latestSelic.valor).replace(",", "."));

    if (Number.isNaN(annualSelicRate)) {
      throw new Error("Valor da Meta Selic não pôde ser convertido.");
    }

    const monthlySelicRate = convertAnnualRateToMonthlyRate(annualSelicRate);

    monthlyRateInput.value = monthlySelicRate.toFixed(2);

    updateAnnualRateHelper();

    selicInfoElement.textContent =
      `Meta Selic carregada: ${formatPercent(annualSelicRate)} ao ano (${latestSelic.data}). Taxa mensal equivalente: ${formatPercent(monthlySelicRate)}.`;
  } catch (error) {
    selicInfoElement.textContent =
      "Não foi possível buscar a Selic agora. Preencha a taxa manualmente.";

    console.error("Erro ao buscar Selic:", error);
  } finally {
    fetchSelicButton.disabled = false;
    fetchSelicButton.textContent = "Buscar Selic";
  }
}

// Função que atualiza o contador de visualizações.
// No site publicado, ela incrementa o contador pela API.
// No Live Server/localhost, ela não incrementa para evitar inflar as visitas durante testes.
async function updateViewCounter() {
  // Se o elemento do contador não existir no HTML, a função para aqui.
  if (!viewCounterElement) {
    return;
  }

  // Verifica se a página está rodando no GitHub Pages publicado.
  const isProductionPage =
    window.location.hostname === "denismmartins-web.github.io";

  // Se estiver no Live Server/localhost, mostra apenas "---".
  if (!isProductionPage) {
    viewCounterElement.textContent = "---";
    return;
  }

  // URL correta da CounterAPI V1.
  // Esse endpoint incrementa +1 visualização e retorna o valor atualizado.
  const counterApiUrl =
    `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`;

  try {
    // Chama a API do contador.
    const response = await fetch(counterApiUrl);

    // Se a resposta HTTP não for válida, gera erro.
    if (!response.ok) {
      throw new Error("Resposta inválida da API de contador.");
    }

    // Converte a resposta em JSON.
    const data = await response.json();

    // Tenta pegar o valor retornado pela API.
    // Deixei flexível para evitar erro se a API retornar o número em outro campo.
    const apiCount = Number(data.value ?? data.count ?? data.data?.value);

    // Se o valor não for válido, tratamos como falha.
    if (Number.isNaN(apiCount) || apiCount <= 0) {
      throw new Error("A API retornou um contador inválido.");
    }

    // Salva o último valor válido no navegador.
    saveLastViewCount(apiCount);

    // Mostra o valor real vindo da API no contador.
    viewCounterElement.textContent = formatViewCount(apiCount);

  } catch (error) {
    // Se a API falhar, usamos o último valor salvo no localStorage como fallback.
    const savedCount = getLastSavedViewCount();

    viewCounterElement.textContent = savedCount > 0
      ? `${formatViewCount(savedCount)}+`
      : "---";

    console.error("Erro ao atualizar contador de visualizações:", error);
  }
}

// Verifica se o botão da API existe antes de adicionar o evento.
if (fetchSelicButton) {
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
if (simulatorForm) {
  simulatorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const initialValue = getNumberFromInput(initialValueInput);
    const monthlyContribution = getNumberFromInput(monthlyContributionInput);
    const monthlyRate = getNumberFromInput(monthlyRateInput);
    const months = getNumberFromInput(monthsInput);
    const taxMode = taxModeInput.value;

    const errorMessage = validateFields(
      initialValue,
      monthlyContribution,
      monthlyRate,
      months
    );

    if (errorMessage) {
      errorMessageElement.textContent = errorMessage;
      resultArea.classList.add("hidden");
      clearTaxTableHighlight();
      return;
    }

    errorMessageElement.textContent = "";

    const simulation = calculateSimulation(
      initialValue,
      monthlyContribution,
      monthlyRate,
      months,
      taxMode
    );

    showResults(simulation, months, taxMode);
  });
}

// Atualiza os textos auxiliares assim que a página carrega.
updateAnnualRateHelper();
updateMonthsHelper();
updateViewCounter();
