// Подключение общих стилей и логика мобильного меню (бургер)
import './styles.css'
// Форма «Оставить заявку» на главной (если разметки нет — скрипт ничего не делает)
import './lead-form.js'

const toggle = document.querySelector('.nav-toggle')
const nav = document.querySelector('.site-nav')

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
}
