"use client"
import emailjs from "@emailjs/browser"
import Alert from "@/components/Alert"
import useAlert from "@/hooks/useAlert"
import { useRef, useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
  name: string
  email: string
  message: string
}

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null)

  const { alert, showAlert, hideAlert } = useAlert()
  const [loading, setLoading] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: form.name,
          to_name: "Matthijs van Nistelrooij",
          from_email: form.email,
          to_email: "matthijs.vannistelrooy@gmail.com",
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false)
          showAlert({
            show: true,
            text: "Thank you for your message 😃",
            type: "success",
          })

          setTimeout(() => {
            hideAlert({ show: false })
            setForm({
              name: "",
              email: "",
              message: "",
            })
          }, 3000)
        },
        (error) => {
          setLoading(false)
          console.error(error)

          showAlert({
            show: true,
            text: "I didn't receive your message 😢",
            type: "danger",
          })
        }
      )
  }

  return (
    <section className="flex items-center justify-center h-screen p-5 bg-gradient-to-bl from-purple-50 via-blue-50 to-orange-50">
      {alert.show && <Alert {...alert} />}

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-[700px]">
        <h3 className="font-semibold text-2xl mb-6 text-center">Contact</h3>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Naam"
            className="border-gray-300 focus:ring focus:ring-indigo-200"
          />
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="E-mail"
            className="border-gray-300 focus:ring focus:ring-indigo-200"
          />
          <Textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Je bericht"
            className="border-gray-300 focus:ring focus:ring-indigo-200"
          />
          <Button
            className="rounded-lg p-2 w-full text-white"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </section>
  )
}

export default Contact
