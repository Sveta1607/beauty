// Модальное окно заявки на главной: открытие по кнопке, POST /api/application, текст ошибок в форме
const dialog = document.getElementById('lead-dialog')
const openBtn = document.getElementById('lead-open-btn')
const form = document.getElementById('lead-form')
const cancelBtn = document.getElementById('lead-cancel-btn')
const statusEl = document.getElementById('lead-form-status')

// Оставляем в поле телефона только цифры, максимум 10 (префикс +7 подставляем при отправке)
const phoneLocalInput = document.getElementById('lead-phone-local')

if (dialog && openBtn && form && cancelBtn && statusEl) {
  if (phoneLocalInput) {
    phoneLocalInput.addEventListener('input', () => {
      const digits = phoneLocalInput.value.replace(/\D/g, '').slice(0, 10)
      phoneLocalInput.value = digits
    })
  }

  openBtn.addEventListener('click', () => {
    statusEl.textContent = ''
    const submitBtn = document.getElementById('lead-submit-btn')
    if (submitBtn) submitBtn.disabled = false
    dialog.showModal()
  })

  cancelBtn.addEventListener('click', () => {
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

    if (phone.length !== 12) {
      statusEl.textContent = 'Введите 10 цифр мобильного номера.'
      return
    }

    const submitBtn = document.getElementById('lead-submit-btn')
    submitBtn.disabled = true
    statusEl.textContent = ''

    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        statusEl.textContent = data.error || 'Не удалось отправить. Попробуйте позже.'
        submitBtn.disabled = false
        return
      }
      form.reset()
      dialog.close()
      window.alert('Спасибо! Заявка принята. Мы свяжемся с вами.')
    } catch {
      statusEl.textContent =
        'Нет связи с сервером. Для локальной проверки запустите в отдельном терминале: npm run server'
      submitBtn.disabled = false
    }
  })
}
