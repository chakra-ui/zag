export const SKIN_TONES = ["none", "light", "medium-light", "medium", "medium-dark", "dark"] as const

export type SkinTone = (typeof SKIN_TONES)[number]

export type Locale =
  | "bn"
  | "da"
  | "de"
  | "en-gb"
  | "en"
  | "es-mx"
  | "es"
  | "et"
  | "fi"
  | "fr"
  | "hi"
  | "hu"
  | "it"
  | "ja"
  | "ko"
  | "lt"
  | "ms"
  | "nb"
  | "nl"
  | "pl"
  | "pt"
  | "ru"
  | "sv"
  | "th"
  | "uk"
  | "vi"
  | "zh-hant"
  | "zh"

export interface EmojibaseEmoji {
  emoji: string
  group?: number
  subgroup?: number
  version: number
  label: string
  tags?: string[]
  skins?: Array<{ emoji: string; tone?: number }>
}

export interface EmojibaseEmojiWithGroup extends EmojibaseEmoji {
  group: number
}

export interface EmojibaseMessagesDataset {
  groups: Array<{
    key: string
    order: number
    message: string
  }>
  subgroups: Array<{
    key: string
    order: number
    message: string
  }>
  skinTones: Array<{
    key: SkinTone
    message: string
  }>
}

export interface EmojiDataEmoji {
  emoji: string
  category: number
  label: string
  version: number
  tags: string[]
  countryFlag?: true
  skins?: Record<Exclude<SkinTone, "none">, string>
}

export interface EmojiDataCategory {
  index: number
  label: string
}

export interface EmojiData {
  locale: Locale
  emojis: EmojiDataEmoji[]
  categories: EmojiDataCategory[]
  skinTones: Record<SkinTone, string>
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function isEmojiSupported(emoji: string): boolean {
  if (typeof document === "undefined") return false

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) return false

  canvas.width = 2
  canvas.height = 2

  context.textBaseline = "top"
  context.font = "16px Arial"

  // Measure the emoji
  context.fillStyle = "#000"
  context.fillText(emoji, 0, 0)
  const data1 = context.getImageData(0, 0, 2, 2).data

  context.clearRect(0, 0, 2, 2)
  context.fillStyle = "#fff"
  context.fillText(emoji, 0, 0)
  const data2 = context.getImageData(0, 0, 2, 2).data

  // Compare the two renderings
  return !data1.every((value, index) => value === data2[index])
}

function getStorage<T>(storage: Storage, key: string, validate: (value: unknown) => T | null): T | null {
  try {
    const item = storage.getItem(key)
    if (item === null) return null

    const parsed = JSON.parse(item)
    return validate(parsed)
  } catch {
    return null
  }
}

function setStorage<T>(storage: Storage, key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or unavailable
  }
}

const EMOJIBASE_EMOJIS_URL = (baseUrl: string, locale: Locale) => `${baseUrl}/${locale}/data.json`
const EMOJIBASE_MESSAGES_URL = (baseUrl: string, locale: Locale) => `${baseUrl}/${locale}/messages.json`

const EMOJIBASE_LOCALES: Locale[] = [
  "bn",
  "da",
  "de",
  "en-gb",
  "en",
  "es-mx",
  "es",
  "et",
  "fi",
  "fr",
  "hi",
  "hu",
  "it",
  "ja",
  "ko",
  "lt",
  "ms",
  "nb",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "th",
  "uk",
  "vi",
  "zh-hant",
  "zh",
]

const EMOJIBASE_DEFAULT_LOCALE: Locale = "en"

export const LOCAL_DATA_KEY = (locale: string) => `frimousse/data/${locale}`
export const SESSION_METADATA_KEY = "frimousse/metadata"

type GetEmojiDataOptions = {
  locale: Locale
  emojiVersion?: number
  emojibaseUrl?: string
  signal?: AbortSignal
}

type LocalData = {
  data: EmojiData
  metadata: {
    emojisEtag: string | null
    messagesEtag: string | null
  }
}

type SessionMetadata = {
  emojiVersion: number
  countryFlags: boolean
}

async function fetchEtag(url: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(url, { method: "HEAD", signal })
    return response.headers.get("etag")
  } catch {
    return null
  }
}

async function fetchEmojibaseData(baseUrl: string, locale: Locale, signal?: AbortSignal) {
  const [{ emojis, emojisEtag }, { messages, messagesEtag }] = await Promise.all([
    fetch(EMOJIBASE_EMOJIS_URL(baseUrl, locale), { signal }).then(async (response) => {
      return {
        emojis: (await response.json()) as EmojibaseEmoji[],
        emojisEtag: response.headers.get("etag"),
      }
    }),
    fetch(EMOJIBASE_MESSAGES_URL(baseUrl, locale), { signal }).then(async (response) => {
      return {
        messages: (await response.json()) as EmojibaseMessagesDataset,
        messagesEtag: response.headers.get("etag"),
      }
    }),
  ])

  return {
    emojis,
    messages,
    emojisEtag,
    messagesEtag,
  }
}

async function fetchEmojibaseEtags(baseUrl: string, locale: Locale, signal?: AbortSignal) {
  const [emojisEtag, messagesEtag] = await Promise.all([
    fetchEtag(EMOJIBASE_EMOJIS_URL(baseUrl, locale), signal),
    fetchEtag(EMOJIBASE_MESSAGES_URL(baseUrl, locale), signal),
  ])

  return {
    emojisEtag,
    messagesEtag,
  }
}

export function getEmojibaseSkinToneVariations(
  emoji: EmojibaseEmojiWithGroup,
): Record<Exclude<SkinTone, "none">, string> | undefined {
  if (!emoji.skins) {
    return
  }

  const skinToneVariations = emoji.skins.filter((emoji) => typeof emoji.tone === "number")

  return skinToneVariations.reduce(
    (result, emoji) => {
      const skinTone = SKIN_TONES[emoji.tone as number]!
      result[skinTone as Exclude<SkinTone, "none">] = emoji.emoji
      return result
    },
    {} as Record<Exclude<SkinTone, "none">, string>,
  )
}

async function fetchEmojiData(baseUrl: string, locale: Locale, signal?: AbortSignal): Promise<EmojiData> {
  const { emojis, emojisEtag, messages, messagesEtag } = await fetchEmojibaseData(baseUrl, locale, signal)

  const countryFlagsSubgroup = messages.subgroups.find(
    (subgroup) => subgroup.key === "country-flag" || subgroup.key === "subdivision-flag",
  )

  const filteredGroups = messages.groups.filter((group) => group.key !== "component")

  const filteredEmojis = emojis.filter((emoji) => {
    return "group" in emoji
  }) as EmojibaseEmojiWithGroup[]

  const categories = filteredGroups.map((group) => ({
    index: group.order,
    label: capitalize(group.message),
  }))

  const skinTones = messages.skinTones.reduce(
    (skinTones, skinTone) => {
      skinTones[skinTone.key] = capitalize(skinTone.message)
      return skinTones
    },
    {} as Record<SkinTone, string>,
  )

  const formattedEmojis = filteredEmojis.map((emoji) => {
    return {
      emoji: emoji.emoji,
      category: emoji.group,
      version: emoji.version,
      label: capitalize(emoji.label),
      tags: emoji.tags ?? [],
      countryFlag: (countryFlagsSubgroup && emoji.subgroup === countryFlagsSubgroup.order) || undefined,
      skins: getEmojibaseSkinToneVariations(emoji),
    } satisfies EmojiDataEmoji
  })

  const emojiData: EmojiData = {
    locale,
    emojis: formattedEmojis,
    categories,
    skinTones,
  }

  if (typeof localStorage !== "undefined") {
    setStorage(localStorage, LOCAL_DATA_KEY(locale), {
      data: emojiData,
      metadata: {
        emojisEtag,
        messagesEtag,
      },
    })
  }

  return emojiData
}

function getSessionMetadata(emojis: EmojiDataEmoji[], emojiVersion?: number): SessionMetadata {
  const versionEmojis = new Map<number, string>()

  for (const emoji of emojis) {
    if (!versionEmojis.has(emoji.version)) {
      versionEmojis.set(emoji.version, emoji.emoji)
    }
  }

  const descendingVersions = [...versionEmojis.keys()].sort((a, b) => b - a)
  const highestVersion = descendingVersions[0] ?? 0
  const supportsCountryFlags = isEmojiSupported("🇪🇺")

  if (typeof emojiVersion === "number") {
    return {
      emojiVersion,
      countryFlags: supportsCountryFlags,
    }
  }

  for (const version of descendingVersions) {
    const emoji = versionEmojis.get(version)!
    if (isEmojiSupported(emoji)) {
      return {
        emojiVersion: version,
        countryFlags: supportsCountryFlags,
      }
    }
  }

  return {
    emojiVersion: highestVersion,
    countryFlags: supportsCountryFlags,
  }
}

const validateSessionMetadata = (value: unknown): SessionMetadata | null => {
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>
    if (typeof obj.emojiVersion === "number" && typeof obj.countryFlags === "boolean") {
      return obj as SessionMetadata
    }
  }
  return null
}

const validateLocalData = (value: unknown): LocalData | null => {
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>
    if (obj.data && obj.metadata && typeof obj.data === "object") {
      return obj as LocalData
    }
  }
  return null
}

export async function getEmojiData({
  locale,
  emojiVersion,
  emojibaseUrl,
  signal,
}: GetEmojiDataOptions): Promise<EmojiData> {
  const baseUrl =
    typeof emojibaseUrl === "string"
      ? emojibaseUrl
      : `https://cdn.jsdelivr.net/npm/emojibase-data@${typeof emojiVersion === "number" ? Math.floor(emojiVersion) : "latest"}`

  let sessionMetadata =
    typeof sessionStorage !== "undefined"
      ? getStorage<SessionMetadata>(sessionStorage, SESSION_METADATA_KEY, validateSessionMetadata)
      : null

  const localData =
    typeof localStorage !== "undefined"
      ? getStorage<LocalData>(localStorage, LOCAL_DATA_KEY(locale), validateLocalData)
      : null

  let data: EmojiData

  if (!localData) {
    data = await fetchEmojiData(baseUrl, locale, signal)
  } else if (sessionMetadata) {
    data = localData.data
  } else {
    try {
      const { emojisEtag, messagesEtag } = await fetchEmojibaseEtags(baseUrl, locale, signal)

      data =
        !emojisEtag ||
        !messagesEtag ||
        emojisEtag !== localData.metadata.emojisEtag ||
        messagesEtag !== localData.metadata.messagesEtag
          ? await fetchEmojiData(baseUrl, locale, signal)
          : localData.data
    } catch {
      data = localData.data
    }
  }

  sessionMetadata ??= getSessionMetadata(data.emojis, emojiVersion)

  if (typeof sessionStorage !== "undefined") {
    setStorage(sessionStorage, SESSION_METADATA_KEY, sessionMetadata)
  }

  const filteredEmojis = data.emojis.filter((emoji) => {
    const isSupportedVersion = emoji.version <= sessionMetadata!.emojiVersion
    return emoji.countryFlag ? isSupportedVersion && sessionMetadata!.countryFlags : isSupportedVersion
  })

  return {
    locale,
    emojis: filteredEmojis,
    categories: data.categories,
    skinTones: data.skinTones,
  }
}

export function validateLocale(locale: string): Locale {
  if (!EMOJIBASE_LOCALES.includes(locale as Locale)) {
    console.warn(`Locale "${locale}" is not supported, using "${EMOJIBASE_DEFAULT_LOCALE}" instead.`)
    return EMOJIBASE_DEFAULT_LOCALE
  }
  return locale as Locale
}

export function validateSkinTone(skinTone: string): SkinTone {
  if (!SKIN_TONES.includes(skinTone as SkinTone)) {
    console.warn(`Skin tone "${skinTone}" is not valid, using "none" instead.`)
    return "none"
  }
  return skinTone as SkinTone
}

export class EmojiLoader {
  private options: GetEmojiDataOptions
  private dataCache = new Map<string, Promise<EmojiData>>()

  constructor(options: Partial<GetEmojiDataOptions> = {}) {
    this.options = {
      locale: validateLocale(options.locale || "en"),
      emojiVersion: options.emojiVersion,
      emojibaseUrl: options.emojibaseUrl,
    }
  }

  async load(overrideOptions?: Partial<GetEmojiDataOptions>): Promise<EmojiData> {
    const finalOptions = { ...this.options, ...overrideOptions }
    const cacheKey = `${finalOptions.locale}-${finalOptions.emojiVersion || "latest"}`

    if (!this.dataCache.has(cacheKey)) {
      this.dataCache.set(cacheKey, getEmojiData(finalOptions))
    }

    return this.dataCache.get(cacheKey)!
  }

  async loadWithLocale(locale: Locale): Promise<EmojiData> {
    return this.load({ locale: validateLocale(locale) })
  }

  clearCache(): void {
    this.dataCache.clear()
  }

  setOptions(options: Partial<GetEmojiDataOptions>): void {
    this.options = { ...this.options, ...options }
    if (options.locale) {
      this.options.locale = validateLocale(options.locale)
    }
  }

  async getEmojiLabel(emoji: string, locale?: Locale): Promise<string | null> {
    const data = await this.load({ locale })
    const found = data.emojis.find((e) => e.emoji === emoji)
    return found?.label || null
  }

  async getEmojiLabels(emojis: string[], locale?: Locale): Promise<Record<string, string | null>> {
    const data = await this.load({ locale })
    const emojiMap = new Map(data.emojis.map((e) => [e.emoji, e.label]))

    return emojis.reduce(
      (result, emoji) => {
        result[emoji] = emojiMap.get(emoji) || null
        return result
      },
      {} as Record<string, string | null>,
    )
  }
}
