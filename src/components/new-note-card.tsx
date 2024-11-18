import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

import type { INote } from '../app'

interface INewNoteCardProps {
  onNoteCreated: (note: INote) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: INewNoteCardProps) {
  const [content, setContent] = useState('')
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor(shouldShow: boolean) {
    if (shouldShow) {
      setShouldShowOnBoarding(true)
      return
    }

    setShouldShowOnBoarding(false)
  }

  function handleContentChanged({ target }: ChangeEvent<HTMLTextAreaElement>) {
    if (!target.value.length) {
      setShouldShowOnBoarding(true)
    }

    setContent(target.value)
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content.length === 0) {
      return
    }

    const note = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
    }

    onNoteCreated(note)

    setContent('')
    setShouldShowOnBoarding(true)

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAvailable =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

    if (!isSpeechRecognitionAvailable) {
      toast.error('Navegador não suporta o reconhecimento de fala')

      return
    }

    setIsRecording(true)
    setShouldShowOnBoarding(false)

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)
    speechRecognition?.stop()
  }

  return (
    <Dialog.Root onOpenChange={handleStartEditor}>
      <Dialog.Trigger className="flex flex-col gap-3 rounded-md bg-slate-700 p-5 text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-500">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/30" />

        <Dialog.Content className="fixed inset-0 z-20 flex flex-col overflow-hidden bg-slate-700 md:inset-auto md:left-1/2 md:top-1/2 md:h-[60vh] md:min-w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex flex-1 flex-col" onSubmit={handleSaveNote}>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar Nota
              </span>

              {shouldShowOnBoarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{' '}
                  <button
                    type="button"
                    className="font-medium text-lime-400 hover:underline"
                    onClick={handleStartRecording}
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    type="button"
                    className="font-medium text-lime-400 hover:underline"
                    onClick={() => handleStartEditor(false)}
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="flex-1 resize-none bg-transparent text-sm leading-6 text-slate-400 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                  name="content"
                  required
                />
              )}
            </div>

            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex w-full items-center justify-center gap-3 bg-slate-900 py-4 text-center text-sm font-medium text-slate-300 outline-none hover:text-slate-100"
                >
                  <div className="size-3 animate-pulse rounded-full bg-red-500" />
                  Gravando! (clique p/ interromper)
                </button>

                <button disabled className="d-none" type="submit" />
              </>
            ) : (
              <button
                type="submit"
                className="w-full bg-lime-400 py-4 text-center text-sm font-medium text-lime-950 outline-none hover:bg-lime-400/80"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
