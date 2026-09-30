import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { addDrink, getDrinks, removeDrink } from '../server/drinks.functions.js'
import { CATEGORY_META, CategoryIcon } from '../components/CategoryIcon.js'
import type { Category } from '../server/drinks.server.js'

export const Route = createFileRoute('/')({
  loader: async () => {
    const drinks = await getDrinks()
    return { drinks }
  },
  component: Home,
})

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

function photoUrl(photoKey: string, width: number) {
  return `/.netlify/images?url=/api/photos/${photoKey}&w=${width}&h=${width}&fit=cover&fm=webp`
}

function Home() {
  const { drinks } = Route.useLoaderData()
  const router = useRouter()

  const [category, setCategory] = useState<Category>('cocktail')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const total = drinks.length
  const counts = CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = drinks.filter((d) => d.category === c).length
      return acc
    },
    {} as Record<Category, number>,
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return f ? URL.createObjectURL(f) : null
    })
  }

  function resetForm() {
    setFile(null)
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Dodaj najpierw zdjęcie drinka.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('photo', file)
      formData.set('category', category)
      await addDrink({ data: formData })
      resetForm()
      await router.invalidate()
    } catch {
      setError('Nie udało się dodać drinka. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await removeDrink({ data: { id } })
    await router.invalidate()
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-[image:linear-gradient(rgba(10,16,28,0.25),rgba(10,16,28,0.55)),url('/greece-bg.svg')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Hero */}
      <header className="relative overflow-hidden pb-14 pt-12 text-center text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-100">
          Wakacyjny licznik
        </p>
        <h1 className="mt-2 px-4 text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
          Kasiula w Grecji
        </h1>

        {/* Total counter */}
        <div className="mx-auto mt-8 w-fit rounded-2xl bg-white/15 px-10 py-5 backdrop-blur-sm ring-1 ring-white/30">
          <div className="text-6xl font-black tabular-nums sm:text-7xl">{total}</div>
          <div className="mt-1 text-sm font-medium uppercase tracking-widest text-sky-100">
            wypitych drinków
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-3 px-4">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c]
            return (
              <div
                key={c}
                className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 shadow-sm"
              >
                <CategoryIcon category={c} className={`h-5 w-5 ${meta.color}`} />
                <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-900">
                  {counts[c]}
                </span>
              </div>
            )
          })}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {/* Add drink form */}
        <section className="-mt-8 rounded-2xl bg-stone-100 p-5 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Dodaj drinka</h2>
          <p className="mt-1 text-sm text-slate-500">
            Wgraj zdjęcie i wybierz pasujący piktogram.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5 sm:flex-row">
            <label
              htmlFor="photo-input"
              className="group relative flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-400 hover:bg-sky-50 sm:w-40"
            >
              {preview ? (
                <img src={preview} alt="Podgląd" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-sky-500">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-xs font-medium">Dodaj zdjęcie</span>
                </span>
              )}
              <input
                id="photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            <div className="flex flex-1 flex-col gap-4">
              <div>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Rodzaj drinka
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CATEGORIES.map((c) => {
                    const meta = CATEGORY_META[c]
                    const selected = category === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition ${
                          selected
                            ? `border-transparent ${meta.bg} ring-2 ${meta.ring}`
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <CategoryIcon category={c} className={`h-6 w-6 ${meta.color}`} />
                        <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {submitting ? 'Dodawanie...' : 'Dodaj drinka'}
              </button>
            </div>
          </form>
        </section>

        {/* Gallery */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-white drop-shadow-sm">
            Galeria ({total})
          </h2>

          {drinks.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 py-16 text-center text-slate-500">
              Jeszcze żadnych drinków. Dodaj pierwsze zdjęcie powyżej!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {drinks.map((drink) => {
                const meta = CATEGORY_META[drink.category as Category]
                return (
                  <div
                    key={drink.id}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-900/5"
                  >
                    <img
                      src={photoUrl(drink.photoKey, 400)}
                      alt={meta.label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className={`absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full ${meta.bg} shadow`}
                      title={meta.label}
                    >
                      <CategoryIcon category={drink.category as Category} className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(drink.id)}
                      aria-label="Usuń"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
