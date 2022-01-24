const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Frequency = require('../shared/Frequency')
const APIErrorCode = require('../shared/APIErrorCode')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.post('/v1/:id?/create-payment-intent', async (req, res) => {
  const { amount, frequency: frequencyValue, email, currency } = req.body

  // Create a PaymentIntent with the order amount and currency
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true
      }
    }, req.stripeOptions)

    res.send({ clientSecret: intent.client_secret })
  } catch (error) {
    console.log(error)
    if ((
      (error.code === 'parameter_invalid_integer' && error.param === 'amount') ||
      (error.type === 'StripeInvalidRequestError' && error.param === 'payment_method_types')
    ) && Number.isInteger(amount)) {
      return res.status(400).send({ error: { code: APIErrorCode.STRIPE_TOO_SMALL } })
    }
    return res.status(500).send({ stripeError: error })
  }
})

app.post('/v1/:id?/get-paypal-plan-id', (req, res) => {
  res.send(`paypal plan for ${req.params.id}!`)
})

app.get('/v1/:id?/events', (req, res) => {
  res.send(`Events for ${Frequency.ONE_TIME.value}!`)
})

const port = process.env.PORT || 8080
app.listen(port)