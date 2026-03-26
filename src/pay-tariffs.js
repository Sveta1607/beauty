// Окно тарифов и переход к форме заявки с редиректом на ЮKassa после отправки
import { openLeadForPayment } from './lead-form.js'

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

  payDialog.querySelectorAll('[data-tariff-pay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-pay-url') ?? '#'
      const label = btn.getAttribute('data-tariff-label') ?? ''
      payDialog.close()
      openLeadForPayment(url, label)
    })
  })
}
