const dummy = (blogs) => {
    return 1
  }
  
  module.exports = {
    dummy
  }

  const totalLikes = (blogs) => {
    return blogs.reduce((acc, item) => acc + item.likes, 0)
  }
  
  module.exports = {
    dummy, 
    totalLikes
  }