// Модальное окно заявки: «Оставить заявку», либо сценарий оплаты (тариф → те же поля → письмо → редирект на ЮKassa)
const dialog = document.getElementById('lead-dialog')
const openBtn = document.getElementById('lead-open-btn')
const form = document.getElementById('lead-form')
const cancelBtn = document.getElementById('lead-cancel-btn')
const statusEl = document.getElementById('lead-form-status')
const titleEl = document.getElementById('lead-dialog-title')
const introEl = document.getElementById('lead-dialog-intro')
const tariffCtxEl = document.getElementById('lead-tariff-context')

const phoneLocalInput = document.getElementById('lead-phone-local')

/** URL оплаты после успешной отправки; задаётся из окна тарифов */
let pendingPaymentUrl = null
/** Подпись тарифа для письма и отображения */
let pendingTariffLabel = ''

function resetPaymentMode() {
  pendingPaymentUrl = null
  pendingTariffLabel = ''
}

/** Обновляет заголовок и подсказки в зависимости от сценария (обычная заявка / оплата) */
function updateLeadDialogMode() {
  if (!titleEl) return
  if (pendingTariffLabel) {
    titleEl.textContent = 'Данные для оплаты'
    if (introEl) {
      introEl.hidden = false
      introEl.textContent =
        'Заполните контакты: заявка уйдёт на почту, затем откроется страница оплаты выбранного тарифа.'
    }
    if (tariffCtxEl) {
      tariffCtxEl.hidden = false
      tariffCtxEl.textContent = `Тариф: ${pendingTariffLabel}`
    }
  } else {
    titleEl.textContent = 'Оставить заявку'
    if (introEl) {
      introEl.hidden = true
      introEl.textContent = ''
    }
    if (tariffCtxEl) {
      tariffCtxEl.hidden = true
      tariffCtxEl.textContent = ''
    }
  }
}

/** Безопасное открытие dialog (старые браузеры без showModal не ломают страницу) */
function safeShowModal(d) {
  if (!d || typeof d.showModal !== 'function') return
  try {
    d.showModal()
  } catch (err) {
    console.error('[lead-form] showModal:', err)
    window.alert(
      'Не удалось открыть окно формы. Обновите браузер или откройте сайт через npm run dev на современном Chrome / Firefox / Edge.',
    )
  }
}

/**
 * Открывает форму после выбора тарифа: закрыть тарифы вызывает pay-tariffs.js до этого.
 * @param {string} payUrl — ссылка ЮKassa (https://...) или «#» пока не настроена
 * @param {string} tariffLabel — строка для письма и блока «Тариф»
 */
export function openLeadForPayment(payUrl, tariffLabel) {
  if (!dialog || !statusEl) return
  pendingPaymentUrl = payUrl && payUrl.trim() !== '' ? payUrl : '#'
  pendingTariffLabel = tariffLabel || ''
  statusEl.textContent = ''
  const submitBtn = document.getElementById('lead-submit-btn')
  if (submitBtn) submitBtn.disabled = false
  updateLeadDialogMode()
  safeShowModal(dialog)
}

function isValidPaymentRedirect(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim())
}

if (dialog && openBtn && form && cancelBtn && statusEl) {
  if (phoneLocalInput) {
    phoneLocalInput.addEventListener('input', () => {
      const digits = phoneLocalInput.value.replace(/\D/g, '').slice(0, 10)
      phoneLocalInput.value = digits
    })
  }

  openBtn.addEventListener('click', () => {
    resetPaymentMode()
    updateLeadDialogMode()
    statusEl.textContent = ''
    const submitBtn = document.getElementById('lead-submit-btn')
    if (submitBtn) submitBtn.disabled = false
    safeShowModal(dialog)
  })

  cancelBtn.addEventListener('click', () => {
    resetPaymentMode()
    updateLeadDialogMode()
    dialog.close()
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const localDigits = String(fd.get('phoneLocal') ?? '').replace(/\D/g, '').slice(0, 10)
    const phone = localDigits.length === 10 ? `+7${localDigits}` : ''

    const body = {
      firstName: String(fd.get('firstName') ?? '').trim(),
      lastName: String(fd.get('lastName') ?? '').trim(),
      phone,
      email: String(fd.get('email') ?? '').trim(),
    }

    if (pendingTariffLabel) {
      body.tariff = pendingTariffLabel
    }

    if (phone.length !== 12) {
      statusEl.textContent = 'Введите 10 цифр мобильного номера.'
      return
    }

    const submitBtn = document.getElementById('lead-submit-btn')
    if (submitBtn) submitBtn.disabled = true
    statusEl.textContent = ''

    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      let data = {}
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        data = await res.json().catch(() => ({}))
      }
      if (!res.ok) {
        if (res.status === 502) {
          statusEl.textContent =
            'Шлюз вернул 502: приложение на сервере не ответило (перезапуск, неверный порт или падение Node). На Amvera откройте логи контейнера; локально запустите «npm run server» и обновите страницу.'
        } else {
          statusEl.textContent = data.error || `Ошибка сервера (${res.status}). Попробуйте позже.`
        }
        if (submitBtn) submitBtn.disabled = false
        return
      }

      const redirectAfter = pendingPaymentUrl
      const hadPaymentFlow = Boolean(pendingTariffLabel)

      form.reset()
      resetPaymentMode()
      updateLeadDialogMode()
      dialog.close()

      if (hadPaymentFlow && redirectAfter && isValidPaymentRedirect(redirectAfter)) {
        window.location.href = redirectAfter.trim()
        return
      }

      if (hadPaymentFlow && redirectAfter === '#') {
        window.alert(
          'Заявка отправлена. После настройки ссылки ЮKassa в разметке (data-pay-url) здесь откроется оплата.',
        )
        return
      }

      window.alert('Спасибо! Заявка принята. Мы свяжемся с вами.')
    } catch {
      statusEl.textContent =
        'Сервер API не отвечает. Если вы на компьютере: во втором терминале выполните «npm run server» (порт 8787), оставьте «npm run dev». На хостинге проверьте, что приложение Node запущено.'
      if (submitBtn) submitBtn.disabled = false
    }
  })
}
