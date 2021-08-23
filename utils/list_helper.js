const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, item) => acc + item.likes, 0)
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) {
        return {}
    }

    var maxBlog = blogs[0]
    for(const curr of blogs) {
        if (curr.likes > maxBlog.likes) {
            maxBlog = curr
        }
    }

    return {
        title: maxBlog.title,
        author: maxBlog.author,
        likes: maxBlog.likes
    }
}

const mostBlogs = (blogs) => {
    const map = new Map()
    blogs.forEach(blog => {
        map.has(blog.author) ? 
        map.set(blog.author, map.get(blog.author) + 1) : 
        map.set(blog.author, 1)
    })

    const authorCounts = [...map]

    if(authorCounts.length === 0) {
        return {}
    }

    var [maxAuthor, blogCount] = authorCounts[0]
    for(const [currAuthor, currBlogCount] of authorCounts) {
        if (currBlogCount > blogCount) {
            maxAuthor = currAuthor
            blogCount = currBlogCount
        }
    }

    return {
        author: maxAuthor,
        blogs: blogCount
    }
}
  
  module.exports = {
    dummy, 
    totalLikes,
    favoriteBlog,
    mostBlogs
  }