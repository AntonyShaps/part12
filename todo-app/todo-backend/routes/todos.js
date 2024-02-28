const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const { getAsync, setAsync } = require('../redis');


/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});





/* POST todo to listing. */
router.post('/', async (req, res) => {
  try {

    const todo = await Todo.create({
      text: req.body.text,
      done: false
    });

    const currentCount = await getAsync('count');
    const newCount = parseInt(currentCount || '0') + 1;
    await setAsync('count', newCount.toString());

    res.send(todo);
  } catch (error) {
    console.error('Error adding todo or interacting with Redis:', error);
    res.status(500).send("Error creating todo");
  }
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo); 
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const { text, done } = req.body;
  const foundTodo = req.todo;

	foundTodo.text = text || foundTodo.text;
	foundTodo.done = done || foundTodo.done;

	await foundTodo.save();
  res.send(foundTodo);
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
