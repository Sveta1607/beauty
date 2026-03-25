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

/** Файл заявок с главной (имя, фамилия, телефон, email) */
function resolveApplicationsFilePath() {
  const explicit = process.env.APPLICATIONS_FILE?.trim()
  if (explicit) return explicit
  const persistentDir = process.env.PERSISTENT_DATA_DIR?.trim()
  if (persistentDir) return path.join(persistentDir, 'applications.jsonl')
  return path.join(__dirname, '..', 'data', 'applications.jsonl')
}

const APPLICATIONS_FILE = resolveApplicationsFilePath()

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

/**
 * Сохраняет заявку с главной в JSON Lines (дубль к письму на почту).
 * @param {object} payload — firstName, lastName, phone, email
 */
export async function appendApplication(payload) {
  const line =
    JSON.stringify({
      ...payload,
      createdAt: new Date().toISOString(),
    }) + '\n'
  await fs.mkdir(path.dirname(APPLICATIONS_FILE), { recursive: true })
  await fs.appendFile(APPLICATIONS_FILE, line, 'utf8')
}
