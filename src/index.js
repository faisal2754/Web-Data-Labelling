import express, { json } from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'

// Import routes
import authRoute from './routes/auth'
const app = express()

config()

// Connect to DB
try {
  connect(
    process.env.DB_CONNECT,
    { useUnifiedTopology: true, useNewUrlParser: true },
    () => console.log('connected to db!')
  )
} catch (error) {
  console.log(error)
}

// Middleware
app.use(json())

// Route middleware?
app.use('/api/user', authRoute)

app.listen(3000, () => console.log('Server running'))
