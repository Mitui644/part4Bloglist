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
  
  module.exports = {
    dummy, 
    totalLikes,
    favoriteBlog
  }