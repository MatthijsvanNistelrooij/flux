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
    <section className="flex-center p-5 lg:p-0">
      {alert.show && <Alert {...alert} />}

      <div className="w-[500px] mt-40" onClick={(e) => e.stopPropagation()}>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col space-y-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="naam"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="e-mail"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="je bericht"
            />
          </div>
          <Button
            className="rounded-lg p-2 w-full"
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
