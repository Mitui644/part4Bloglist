const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes ? request.body.likes : 0
  })
  try {
    const result = await blog.save()
    response.status(201).json(result)
  } catch(error) {
    response.status(400).json({ error: error.message })
  }
})

  module.exports = blogsRouter