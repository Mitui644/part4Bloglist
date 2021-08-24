const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for(const blog of helper.initialBlogs) {
        await new Blog(blog).save()
    }
}, 100000)

test('correct amount of blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    for(const blog of response.body) {
        expect(blog.id).toBeDefined()
        expect(blog._id).toBeFalsy()
    }
})

test('a blog can be added', async () => {
    const newBlog = {
        title: "test_title",
        author: "test_author",
        url: "www.blogTest.com",
        likes: 1
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const body = response.body
    expect(body).toHaveLength(helper.initialBlogs.length + 1)
  
    expect(body.map(blog => blog.title)).toContain(newBlog.title)
    expect(body.map(blog => blog.author)).toContain(newBlog.author)
    expect(body.map(blog => blog.url)).toContain(newBlog.url)
    expect(body.map(blog => blog.likes)).toContain(newBlog.likes)
})

test('adding a blog with no likes property defaults to zero', async () => {
    const newBlog = {
        title: "no likes",
        author: "test_author",
        url: "www.blogTest.com"
    }

    await api.post('/api/blogs').send(newBlog)
  
    const response = await api.get('/api/blogs')
    const target = response.body.find(blog => blog.title === newBlog.title)
    expect(target.likes).toBe(0)
})

test('adding blog with no author and title gives 400 bad request', async () => {
    const newBlog = {
        url: "www.no_author_or_title.com",
        likes: 1
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
})

test('a blog can be deleted', async () => {
    var response = await api.get('/api/blogs') 
    const blog = response.body[0]
  
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(204)
  
    response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length - 1)
    const contents = response.body.map(blog => blog.title)
    expect(contents).not.toContain(blog.title)
})

afterAll(() => {
  mongoose.connection.close()
})