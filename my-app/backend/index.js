require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id).then(person=>{
    if(person) {
      response.json(person)
    }else{
      response.status(404).end()
    }
    })
    .catch(error => next(error))
})

app.get('/api/info', (request, response,error) => {
  const now = new Date()

  Person.countDocuments().then(count => {
      const infoString = `<p>Phonebook has info for ${count} people</p>
                          <p>${now}</p>`
      response.send(infoString)
  }).catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result=>{
    response.status(204).end()
  })
  .catch(error => next(error))
})


app.post('/api/persons', (request, response,next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error=>next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const { name, number } = request.body

  const personInfo = {
      name: name,
      number: number,
  }

  Person.findByIdAndUpdate(id, personInfo, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
          if (updatedPerson) {
              response.json(updatedPerson)
          } else {
              response.status(404).end()
          }
      })
      .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/*
  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
        error: 'name exists' 
      })
  }
    if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
*/
