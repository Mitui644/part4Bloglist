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

afterAll(() => {
  mongoose.connection.close()
})