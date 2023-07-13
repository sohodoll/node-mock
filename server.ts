import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import { AbortController } from 'abort-controller'
import cors from 'cors'

const app = express()
const PORT = 3005

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Reference to the ongoing request and its controller
let currentRequest: Request | null = null
let currentController: AbortController | null = null

// Routes
app.post('/search', (req: Request, res: Response) => {
  const searchEmail: string = req.body.email || ''
  const searchNumber: string = req.body.number || ''

  // Cancel the previous request if it is still ongoing
  if (currentController) {
    currentController.abort()
    console.log('Previous request canceled')
  }

  // Create a new AbortController for the current request
  const controller = new AbortController()

  // Store the current request and its controller
  currentRequest = req
  currentController = controller

  // Delay the request processing
  setTimeout(() => {
    // Check if the request is still active
    if (currentRequest === req) {
      fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err)
          currentRequest = null
          currentController = null
          return res.status(500).json({ error: 'Internal Server Error' })
        }

        try {
          const jsonData: any[] = JSON.parse(data)

          const matchingData = jsonData.filter((entry) => {
            const emailMatch: boolean = entry.email.toLowerCase().includes(searchEmail.toLowerCase())
            const numberMatch: boolean = entry.number.includes(searchNumber)
            return emailMatch && numberMatch
          })

          currentRequest = null
          currentController = null
          res.json(matchingData)
        } catch (error) {
          console.error(error)
          currentRequest = null
          currentController = null
          res.status(500).json({ error: 'Internal Server Error' })
        }
      })
    }
  }, 5000)
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
