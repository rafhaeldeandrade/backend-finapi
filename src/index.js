require('dotenv').config()
const express = require('express')
const crypto = require('crypto')

const app = express()
const customers = []

app.use(express.json())

// Middleware
function verifyIfAccountExists(req, res, next) {
  const { cpf } = req.params

  const customer = customers.find((customer) => customer.cpf === cpf)

  if (!customer) {
    return res.status(404).json({ error: true, message: 'Customer not found' })
  }

  req.customer = customer

  return next()
}

function getBalance(statement) {
  return statement.reduce((prev, curr) => {
    if (curr.type === 'credit') {
      return prev + curr.amount
    } else {
      return prev - curr.amount
    }
  }, 0)
}

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

app.get('/statement/:cpf', verifyIfAccountExists, (req, res) => {
  const { customer } = req

  return res.status(200).json(customer.statement)
})

app.post('/deposit', verifyIfAccountExists, (req, res) => {
  const { description, amount } = req.body

  const { customer } = req

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.post('/withdraw', verifyIfAccountExists, (req, res) => {
  const { amount } = req.body

  const { customer } = req

  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return res.status(400).json({ error: true, message: 'Insufficient funds' })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
