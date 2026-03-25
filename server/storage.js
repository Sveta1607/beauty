// Персистентность без БД: каждое обращение — одна строка JSON (JSON Lines), удобно для бэкапов и просмотра
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Путь к файлу заявок: локально — `data/contacts.jsonl`; на Amvera — абсолютный путь в смонтированном томе `/data`.
 * CONTACTS_FILE — полный путь к файлу; PERSISTENT_DATA_DIR — каталог (файл будет contacts.jsonl внутри него).
 */
function resolveContactsFilePath() {
  const explicit = process.env.CONTACTS_FILE?.trim()
  if (explicit) return explicit
  const persistentDir = process.env.PERSISTENT_DATA_DIR?.trim()
  if (persistentDir) return path.join(persistentDir, 'contacts.jsonl')
  return path.join(__dirname, '..', 'data', 'contacts.jsonl')
}

const CONTACTS_FILE = resolveContactsFilePath()

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
