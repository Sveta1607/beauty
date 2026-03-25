// Модальное окно тарифов: открытие по «Оплатить», закрытие по кнопке «Закрыть»
const payDialog = document.getElementById('tariffs-dialog')
const payOpenBtn = document.getElementById('pay-open-btn')
const payCloseBtn = document.getElementById('pay-close-btn')

if (payDialog && payOpenBtn && payCloseBtn) {
  payOpenBtn.addEventListener('click', () => {
    payDialog.showModal()
  })

  payCloseBtn.addEventListener('click', () => {
    payDialog.close()
  })
}
