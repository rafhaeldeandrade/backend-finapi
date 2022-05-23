require('dotenv').config()
const express = require('express')
const crypto = require('crypto')

const app = express()
const customers = []

app.use(express.json())

app.post('/account', (req, res) => {
  const { cpf, name } = req.body

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  )

  if (customerAlreadyExists) {
    return res
      .status(400)
      .json({ error: true, message: 'Customer already exists' })
  }

  const id = crypto.randomUUID()

  const newAccount = { cpf, name, id, statement: [] }

  customers.push(newAccount)

  return res.status(201).end()
})

app.get('/statement/:cpf', (req, res) => {
  const { cpf } = req.params

  const customer = customers.find((customer) => customer.cpf === cpf)

  if (!customer) {
    return res.status(404).json({ error: true, message: 'Customer not found' })
  }

  return res.status(200).json(customer.statement)
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
