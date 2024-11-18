import { ChangeEvent, useState } from 'react'

import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'

export interface INote {
  id: string
  date: Date
  content: string
}

export function App() {
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState<INote[]>(() => {
    const storedNotes = localStorage.getItem('@nlw-expert:notes:data-1.0.0')

    if (storedNotes) {
      return JSON.parse(storedNotes)
    }

    return []
  })

  function handleSearch({ target }: ChangeEvent<HTMLInputElement>) {
    setSearch(target.value)
  }

  function onNoteCreated(note: INote) {
    const notesArray = [...notes, note]

    setNotes(notesArray)

    localStorage.setItem(
      '@nlw-expert:notes:data-1.0.0',
      JSON.stringify(notesArray),
    )
  }

  function onNoteDeleted(id: string) {
    setNotes((prev) => {
      const notesArray = prev.filter((note) => note.id !== id)

      localStorage.setItem(
        '@nlw-expert:notes:data-1.0.0',
        JSON.stringify(notesArray),
      )

      return notesArray
    })
  }

  function filterNotesBySearch(search: string) {
    return notes.filter((note) =>
      note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )
  }

  const filteredNotes = search.length > 0 ? filterNotesBySearch(search) : notes

  return (
    <div className="mx-auto my-12 max-w-screen-xl space-y-6 px-5">
      <img src={logo} alt="NLW Expert" />

      <form className="w-full">
        <input
          type="text"
          name="search"
          onChange={handleSearch}
          placeholder="Busque em suas notas..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-400"
        />
      </form>

      <div className="h-px bg-slate-700" />

      <div className="grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NewNoteCard onNoteCreated={onNoteCreated} />

        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
        ))}
      </div>
    </div>
  )
}
