// Персистентность без БД: каждое обращение — одна строка JSON (JSON Lines), удобно для бэкапов и просмотра
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** Файл накопления заявок; в git не коммитим (см. .gitignore) */
const CONTACTS_FILE = path.join(__dirname, '..', 'data', 'contacts.jsonl')

/**
 * Добавляет запись обращения с меткой времени UTC.
 * @param {object} payload — уже провалидированные поля (email, message, опционально name, page)
 */
export async function appendContact(payload) {
  const line =
    JSON.stringify({
      ...payload,
      createdAt: new Date().toISOString(),
    }) + '\n'
  await fs.mkdir(path.dirname(CONTACTS_FILE), { recursive: true })
  await fs.appendFile(CONTACTS_FILE, line, 'utf8')
}
