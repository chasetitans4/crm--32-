import { mailjetService } from "../../services/mailjet"

interface Client {
  id: string
  name: string
  email: string
}

const welcomeTemplateId = 12345 // Replace with your actual Mailjet template ID

const welcomeEmailTemplate = `
  <h1>Welcome!</h1>
  <p>Thank you for joining our service.</p>
`

const sendWelcomeEmail = async (client: Client) => {
  try {
    await mailjetService.sendEmail({
      from: { email: "noreply@company.com", name: "Company Name" },
      to: [{ email: client.email, name: client.name }],
      subject: "Welcome to our service!",
      htmlPart: welcomeEmailTemplate,
      templateId: welcomeTemplateId,
    })
    console.log(`Welcome email sent to ${client.email}`)
  } catch (error) {
    console.error("Failed to send welcome email:", error)
  }
}

export const ClientEmailActions = {
  sendWelcomeEmail,
}
