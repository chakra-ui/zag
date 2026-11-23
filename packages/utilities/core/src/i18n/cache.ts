type IntlCtor<O> = new (locale: string, options?: O) => any

// one formatter per locale and options, since creating them is slow
export function cached<O extends object, C extends IntlCtor<O>>(Ctor: C) {
  const cache = new Map<string, InstanceType<C>>()
  return (locale: string, options?: O): InstanceType<C> => {
    const key = locale + (options ? JSON.stringify(Object.entries(options).sort()) : "")
    let formatter = cache.get(key)
    if (!formatter) {
      formatter = new Ctor(locale, options)
      cache.set(key, formatter!)
    }
    return formatter!
  }
}
