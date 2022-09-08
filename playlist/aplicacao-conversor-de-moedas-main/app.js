const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const showAlert = err => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  div.setAttribute('role', 'alert')
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close')

  const removeAlert = () => div.remove()
  button.addEventListener('click', removeAlert)

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}
  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if (!newExchangeRate.conversion_rates) {
        showAlert({ 
          message: 'O objeto precisa ter uma propriedade conversion_rates'
        })
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const getErrormessage = errorType => ({
  'unsupported-code': 'A moeda não exite em nosso banco de dados.',
  'base-code-only-on-pro': 'Informações de moedas que não sejam USD ou EUR só podem ser acessadas a partir...',
  'malformed-request': 'O endpoint do seu request precisa seguir a estrutura correta.',
  'invalid-key': 'A chave da API não é válida.',
  'quota-reached': 'Sua conta alcançou o limite de requests permitido em seu plano atual.',
  'not-available-on-plan': 'Seu plano atual não permite este tipo de request.'
})[errorType] || 'Não foi posível obter as informações.'

const APIKey = '0bdde35d268f3903579f4259'
const getUrl = currency =>
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Sua conexão falhou não foi possivel obter as informações.')
    }

    const exchageRateData = await response.json()

    if (exchageRateData.result === 'error') {
      const errorMessage = getErrormessage(exchageRateData['error-type'])
      throw new Error(errorMessage)
    }

    return state.setExchangeRate(exchageRateData)
  } catch (err) {
    showAlert(err)
  }
}

const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectedAttribute = currency => currency === selectedCurrency ? 'selected' : ''
  const getOptionsAsArray = currency => 
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`

  return Object.keys(conversion_rates)
    .map(getOptionsAsArray)
    .join('')
}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchageRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
}

const showUpdateRates = ({ conversion_rates }) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoundedExchageRate(conversion_rates)
}

const showInitalInfo = ({ conversion_rates }) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)
  showUpdateRates({ conversion_rates })
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitalInfo(exchangeRate)
  }
}

const handleTimesCurrencyOneElInput = () => {
  const { conversion_rates } = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpdateRates(exchangeRate)
}

const handleCurrencyOneElInput = async e => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)
  showUpdateRates(exchangeRate)
}

timesCurrencyOneEl.addEventListener('input', handleTimesCurrencyOneElInput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencyOneElInput)

init()
