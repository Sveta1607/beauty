// Модальное окно заявки на главной: открытие по кнопке, POST /api/application, текст ошибок в форме
const dialog = document.getElementById('lead-dialog')
const openBtn = document.getElementById('lead-open-btn')
const form = document.getElementById('lead-form')
const cancelBtn = document.getElementById('lead-cancel-btn')
const statusEl = document.getElementById('lead-form-status')

if (dialog && openBtn && form && cancelBtn && statusEl) {
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
    const body = {
      firstName: String(fd.get('firstName') ?? '').trim(),
      lastName: String(fd.get('lastName') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
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
