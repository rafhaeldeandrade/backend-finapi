require('dotenv').config()
const express = require('express')
const crypto = require('crypto')

const app = express()
const customers = []

app.use(express.json())

app.post('/account', (req, res) => {
  const { cpf, name } = req.body

  const id = crypto.randomUUID()

  const newAccount = { cpf, name, id, statement: [] }

  customers.push(newAccount)

  return res.status(201).end()
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
