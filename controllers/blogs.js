const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response, next) => {
  const user = request.user
  if(!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes ? request.body.likes : 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const user = request.user
  if(!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const targetBlog = await Blog.findById(request.params.id)

  if(targetBlog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'not authorized tot delete blog' })
  }

  user.blogs = user.blogs.filter(blog => blog.toString() !== targetBlog._id.toString())
  await user.save()
  await Blog.findByIdAndRemove(targetBlog._id.toString())
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const user = request.user
  if(!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const targetBlog = await Blog.findById(request.params.id)

  if(targetBlog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'not authorized tot delete blog' })
  }

  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes 
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter