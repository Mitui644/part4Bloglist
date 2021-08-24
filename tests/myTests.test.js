const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

describe('total likes', () => {

    test('of empty list is zero', () => {
        const result = listHelper.totalLikes([])
        expect(result).toBe(0)
      })
    
      test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(5)
      })
  
    test('of a bigger list is calculated right', () => {
      const result = listHelper.totalLikes(helper.blogs)
      expect(result).toBe(36)
    })
})

describe('The author with most blogs', () => {

    test('of empty list is empty object', () => {
        const result = listHelper.mostBlogs([])
        expect(result).toEqual({})
      })
    
      test('when list has only one blog, equals that', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        expect(result).toEqual({author: 'Edsger W. Dijkstra', blogs: 1})
      })
  
    test('of a bigger list is calculated right', () => {
      const result = listHelper.mostBlogs(helper.blogs)
      expect(result).toEqual({author: 'Robert C. Martin', blogs: 3})
    })
})

describe('The author with most likes', () => {

  test('of empty list is empty object', () => {
      const result = listHelper.mostLikes([])
      expect(result).toEqual({})
    })
  
    test('when list has only one blog, equals that', () => {
      const result = listHelper.mostLikes(listWithOneBlog)
      expect(result).toEqual({author: 'Edsger W. Dijkstra', likes: 5})
    })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.mostLikes(helper.blogs)
    expect(result).toEqual({author: 'Edsger W. Dijkstra', likes: 17})
  })
})