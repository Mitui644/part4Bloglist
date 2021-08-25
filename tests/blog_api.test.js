const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {

    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    const addedUser = await user.save()

    await Blog.deleteMany({})
    for(const blog of helper.initialBlogs) {
        const savedBlog = await new Blog({...blog, user: addedUser._id}).save()
        addedUser.blogs = addedUser.blogs.concat(savedBlog._id)
    }
    await addedUser.save()

    const response = await api.post('/api/login').send({
        username: 'root',
        name: 'newName',
        password: 'sekret',
    })
    root_token = 'bearer ' + response.body.token
}, 100000)

describe('when testing blog api', () => {

    test('correct amount of blogs are returned as json', async () => {
    const response = await api.get('/api/blogs').set('Authorization', root_token)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('unique identifier property of the blog posts is named id', async () => {
        const response = await api.get('/api/blogs').set('Authorization', root_token)
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
        .set('Authorization', root_token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs').set('Authorization', root_token)
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

        await api.post('/api/blogs').set('Authorization', root_token).send(newBlog)
    
        const response = await api.get('/api/blogs').set('Authorization', root_token)
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
        .set('Authorization', root_token)
        .send(newBlog)
        .expect(400)
    })

    test('a blog can be deleted', async () => {
        var response = await api.get('/api/blogs').set('Authorization', root_token) 
        const blog = response.body[0]
    
        await api
        .delete(`/api/blogs/${blog.id}`)
        .set('Authorization', root_token)
        .expect(204)
    
        response = await api.get('/api/blogs').set('Authorization', root_token)
        expect(response.body).toHaveLength(helper.initialBlogs.length - 1)
        const contents = response.body.map(blog => blog.title)
        expect(contents).not.toContain(blog.title)
    })

    test('a blog like count can be updated', async () => {
        var response = await api.get('/api/blogs').set('Authorization', root_token)
        const modifiedBlog = response.body[0]
    
        await api
        .put(`/api/blogs/${modifiedBlog.id}`)
        .set('Authorization', root_token)
        .send({...modifiedBlog, likes: modifiedBlog.likes + 1})
        .expect(200)
    
        response = await api.get('/api/blogs').set('Authorization', root_token)

        const target = response.body.find(blog => blog.title === modifiedBlog.title)
        expect(target.likes).toBe(modifiedBlog.likes + 1)
    })

    test('a blog can not be added without token', async () => {
        const newBlog = {
            title: "this should not be added",
            author: "test_author",
            url: "www.blogTest.com",
            likes: 1
        }
    
        await api
        .post('/api/blogs')
        .set('Authorization', 'bearer NOT_VALID_TOKEN')
        .send(newBlog)
        .expect(401)
    
        const response = await api.get('/api/blogs').set('Authorization', root_token)
        const body = response.body
        expect(body).toHaveLength(helper.initialBlogs.length)
    
        expect(body.map(blog => blog.title)).not.toContain(newBlog.title)
        expect(body.map(blog => blog.author)).not.toContain(newBlog.author)
        expect(body.map(blog => blog.url)).not.toContain(newBlog.url)
        expect(body.map(blog => blog.likes)).not.toContain(newBlog.likes)
    })
})

describe('when testing user api', () => {

    test('user can be added', async () => {
      const usersAtStart = await helper.getUsers()
  
      const newUser = {
        username: 'username',
        name: 'name',
        password: 'password',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.getUsers()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      expect(usersAtEnd.map(user => user.username)).toContain(newUser.username)
      expect(usersAtEnd.map(user => user.name)).toContain(newUser.name)
      expect(usersAtEnd.map(user => user.passwordHash)).not.toContain(newUser.password)
    })
  
    test('creation fails with proper statuscode and message if user not valid', async () => {
        const usersAtStart = await helper.getUsers()
  
        const invalidUsersAndErrors = [
            [
                {
                    username: 'root',
                    name: 'newName',
                    password: '1234',
                },
                '`username` to be unique'
            ],
            [
                {
                    username: 'a',
                    name: 'UsernameTooShort',
                    password: '1234',
                },
                'User validation failed: username:'
            ],
            [
                {
                    username: 'passwordTooShort',
                    name: 'passwordTooShort',
                    password: '1',
                },
                'password must be at least 3 characters long'
            ],
            [
                {
                    name: 'usernameMissing',
                    password: '1234',
                },
                'User validation failed: username:'
            ],
            [
                {
                    username: 'passwordMissing',
                    name: 'passwordMissing',
                },
                'password must be at least 3 characters long'
            ],
        ]

        for(const [invalidUser, errorMessage] of invalidUsersAndErrors) {
            const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain(errorMessage)
    
            const usersAtEnd = await helper.getUsers()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        }
    })
})

afterAll(() => {
  mongoose.connection.close()
})