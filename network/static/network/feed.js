if (
  window.location.pathname !== '/login' &&
  window.location.pathname !== '/register'
) {
  document.addEventListener('DOMContentLoaded', function () {
    load_feed()
    //console.log(memberName)
    if (memberName) {
      console.log(memberName)
      formatted_username = username_format(memberName)
      console.log(formatted_username)
      document.getElementById('nav_username').innerHTML =
        '<strong>' + formatted_username + '</strong>'
      load_member_feed(memberName)
    }
    // Listener for adding posts.  Triggers the submit button to disabled=true when the user inputs.
    const bodyElement = document.getElementById('id_body')
    if (bodyElement) {
      bodyElement.addEventListener('input', activate_post_btn)
    }

    // Listener for the like buttons
    document
      .getElementById('like-me')
      .addEventListener('click', get_post_for_likes)
    document
      .getElementById('unlike-me')
      .addEventListener('click', get_post_for_unlikes)
    // Listener for the followS buttons
    document
      .getElementById('follow-me')
      .addEventListener('click', get_user_to_follow)
    document
      .getElementById('unfollow-me')
      .addEventListener('click', get_user_to_unfollow)

    // Edit Button
    document
      .getElementById('edit-post-button')
      .addEventListener('click', edit_my_post)
  })
}

// --------- New Posts
// Add Post: Enables the submit button when the there is input in the form.
function activate_post_btn() {
  document.getElementById('add_post_btn').disabled = false
}
function load_feed() {
  //console.log(memberName)
  // variables
  // set views
  show_all_posts_view()
  // Get Posts
  fetch('/api/feed')
    .then(response => response.json())
    .then(posts => {
      // send to format the list
      format_feed(posts, '#all-posts')
    })
}
function load_single_feed(username) {
  // variables
  // Clear the div so I don't get duplicates
  document.querySelector('#profile-posts').innerHTML = ''
  // Get Posts
  fetch(`/api/single_feed/${username}`)
    .then(response => response.json())
    .then(posts => {
      // send to format the list
      if (Array.isArray(posts)) {
        format_feed(posts, '#profile-posts')
      } else {
        document.getElementById('no-posts-msg').textContent = posts.text
      }
    })
}
function load_member_feed(memberName) {
  // variables
  username = memberName
  //console.log(username)
  // set views:
  show_member_post_view()
  // Get Posts
  const bodyElement = document.getElementById('id_body')
  if (bodyElement) {
    bodyElement.addEventListener('input', activate_post_btn)
  }
  document.getElementById('create_edit_post').textContent = 'Create Post'
  fetch(`/api/single_feed/${username}`)
    .then(response => response.json())
    .then(posts => {
      if (Array.isArray(posts)) {
        // send to format the list
        format_feed(posts, '#member-post-list')
      } else {
        document.getElementById('no-posts-msg').textContent = posts.text
      }
    })
}
function load_filtered_feed() {
  //document.querySelector('#filtered_posts').innerHTML = ''
  // Get Posts
  fetch('/api/filtered_feed')
    .then(response => response.json())
    .then(posts => {
      // send to format the list
      format_feed(posts, '#filtered-posts')
    })
}
function format_feed(posts, divStructure) {
  //console.log(divStructure)
  startDiv = document.querySelector(divStructure)
  author = ''
  //console.log(startDiv)
  id_code = 's_'

  // Update Welcome (profile-posts does not include a welcome message)
  if (divStructure === '#all-posts') {
    document.getElementById('welcome-h').textContent =
      'Welcome to Our Community'
    document.getElementById('welcome-p').textContent =
      'Feel free to browse our latest posts and explore what our writers have to share. To enjoy the full experience, including personalized features and member-only content, please sign in. You can click on any writer’s name to view their bio, or select a post title to read the full article. We’d love for you to join our group—members can create posts, like content, and connect with others in the community.'
    id_code = 'a_'
  }

  if (divStructure === '#member-post-list') {
    // Welcome for logged in users.
    document.getElementById('welcome-h').textContent = 'Welcome '
    document.getElementById('welcome-p').textContent =
      'You can add a new post or view your existing posts by clicking on any post in the list.'
    id_code = 'm_'
  }
  // loop through each post and render the author and their posts.
  posts.forEach(post => {
    my_author = post.created_by_id

    if (author != my_author) {
      author = my_author
      formatted_author = username_format(post.created_by)
      // create a div for author
      aDiv = document.createElement('div')
      startDiv.appendChild(aDiv)
      aDiv.setAttribute('id', id_code + my_author)
      aDiv.classList.add('row', 'profile-listener')

      aCDiv = document.createElement('div')
      aDiv.appendChild(aCDiv)
      aCDiv.classList.add('col-12', 'author')

      aHeading = document.createElement('h5')
      aCDiv.appendChild(aHeading)

      aHeading.textContent = formatted_author + "'s Posts"

      // add listener to view profile - Duck helped me with the closure.
      // I was getting the last author in all my listeners.
      // the closure helped this issue.
      aDiv.addEventListener(
        'click',
        (function (my_author) {
          return function () {
            load_profile(my_author)
          }
        })(my_author)
      )
    }

    // create div for the posts
    pDiv = document.createElement('div')
    startDiv.appendChild(pDiv)
    pDiv.classList.add('row', 'postsRow')

    // Show the title, time stamp and likes
    columns = [6, 3, 3]
    columns.forEach((column, colIndex) => {
      // Variables
      colClass = 'col-' + column
      switch (colIndex) {
        case 0:
          text = post.title
          colStyle = 'col-title'
          colAlign = 'text-left'
          break
        case 1:
          text = post.create_date
          colStyle = 'col-date'
          colAlign = 'text-left'
          break
        case 2:
          text = String.fromCodePoint(0x2764) + ' ' + post.likes
          colStyle = 'col-Timestamp'
          colAlign = 'text-right'
      }
      // build the columns
      colDiv = document.createElement('div')
      pDiv.appendChild(colDiv)
      colDiv.setAttribute('id', id_code + post.id + '-' + (colIndex + 1))
      colDiv.classList.add('post-listener', colClass, colAlign, colStyle)
      colDiv.textContent = text
      colDiv.addEventListener('click', function () {
        load_single_post(post.id)
      })
    })
  })
}
// --------------------------- Edit Posts -------------------------//
function edit_my_post() {
  const id = document.getElementById('like-me').getAttribute('data_id')
  console.log('from the button - ID: ', id)
  const fetchPath = '/api/display_edit/' + id
  console.log('fetchPath', fetchPath)
  fetch(fetchPath)
    .then(response => {
      // debugging
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Server error:', text)
          throw new Error('Server returned an error page')
        })
      }
      return response.json()
    })
    .then(data => {
      document.getElementById('edit_post').innerHTML = data.form_html
      const form = document.getElementById('edit-post-form')
      form.addEventListener('submit', function (e) {
        e.preventDefault() // keeps focus on same page
        submit_edit_form(form, id)
      })
    })
    // debugging
    .catch(error => console.error('Fetch error:', error))
}

function submit_edit_form(form, id) {
  // Creates a form object from my FormData modelForm
  const formData = new FormData(form)

  // Makes AJAX call to API that gets body data from DB.
  // Headers send information that it is a AJAX call, and sends Token.
  fetch('/api/display_edit/' + id, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
    },
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      if (data.updated_post) {
        document.getElementById('post-text').textContent =
          data.updated_post.body
        document.getElementById('edit_post').innerHTML = '' // Clear form
      } else {
        // Debugging
        console.error('Validation errors:', data.errors)
      }
    })
    .catch(error => console.error('Submission error:', error))
}
// --------------------------- Display Profile -------------------------//
function load_profile(id) {
  // Get profile
  fetch(`/api/single_profile/${id}`)
    .then(response => response.json())
    .then(member => {
      // send to format the list
      format_profile(member)
    })
}
function format_profile(member) {
  show_profile_view()
  checkFollowingStatus(member.id)
  checkMemberIsAuthor(member.id)

  // variables
  this_username = username_format(member.username)

  // populate the HTML
  document.getElementById('welcome-h').textContent = 'Writer Profile'
  document.getElementById('welcome-p').textContent =
    "This is a public writer profile. Here, you can learn more about the author, explore their bio, and discover the posts they've shared with the community. Feel free to browse and get inspired by their work. To unlock full features like creating posts, liking content, and joining the conversation, consider signing in or becoming a member."

  document.getElementById('profile-img').src = member.profile_pic
  document.getElementById('profile-name').textContent = this_username
  document.getElementById('start-date').textContent =
    'Member since ' + member.start_date
  document.getElementById('bio').textContent = member.bio
  document.getElementById('following').textContent =
    'Following: ' + member.followers
  document.getElementById('followed-by').textContent =
    'Followed by: ' + member.following
  document.getElementById('follow-me').data_id = member.id
  document.getElementById('unfollow-me').data_id = member.id

  load_single_feed(member.username)
}

function check_profile_owner(id) {
  console.log('checking if the profile is owned: ' + id)
  fetch(`/api/check_member_profile_is_member/${id}`)
    .then(response => response.json())
    .then(data => {
      console.log('info from fetch', data)
      if (data.profile_is_member) {
        document.getElementById('edit_my_post').style.display = 'block'
      } else {
        document.getElementById('edit_my_post').style.display = 'none'
      }
    })
}

// --------------------------- Display one Post -------------------------//
function load_single_post(id) {
  // variables
  // Get Posts
  fetch(`/api/single_post/${id}`)
    .then(response => response.json())
    .then(post => {
      // send to format the list
      format_single_post(post)
    })
}
function format_single_post(post) {
  show_single_post_view()
  checkLikeStatus(post.id)
  check_profile_owner(post.created_by_id)
  console.log('post created by - from load single post ' + post.created_by)
  this_username = username_format(post.created_by)
  document.getElementById('like-me').setAttribute('data_id', post.id)
  document.getElementById('unlike-me').setAttribute('data_id', post.id)
  document.getElementById('sender-img').src = post.profile_pic
  document.getElementById('post-sender').textContent = this_username
  document.getElementById('post-date').textContent =
    'Originally posted on: ' + post.create_date
  document.getElementById('post-text').textContent = post.body
  document.getElementById('post-title').textContent = post.title
  document.getElementById('post-likes').textContent =
    'Number of likes: ' + post.likes
}
// --------------------------- Like Functions -------------------------//
function checkLikeStatus(id) {
  // Updates the buttons when first rendered based on information in the db.
  fetch(`/api/check_like_status/${id}`)
    .then(response => response.json())
    .then(data => {
      if (data.liked) {
        document.getElementById('like-me').disabled = true
        document.getElementById('unlike-me').disabled = false
      } else {
        document.getElementById('like-me').disabled = false
        document.getElementById('unlike-me').disabled = true
      }
    })
}
function get_post_for_likes() {
  // Called by listener when 'like-me' button is clicked
  button = document.getElementById('like-me')
  button.disabled = true
  document.getElementById('unlike-me').disabled = false
  id = button.getAttribute('data_id')
  console.log('get post for likes id:' + id)
  fetch(`/api/update_likes/${id}`).then(get_new_count)
}
function get_post_for_unlikes() {
  button = document.getElementById('unlike-me')
  button.disabled = true
  document.getElementById('like-me').disabled = false
  id = button.getAttribute('data_id')
  fetch(`/api/update_unlikes/${id}`).then(toggle_likes).then(get_new_count)
}
function get_new_count() {
  const id = document.getElementById('like-me').getAttribute('data_id')
  fetch(`api/count_likes/${id}`)
    .then(response => response.json())
    .then(count => {
      document.getElementById('post-likes').textContent =
        'Number of likes: ' + count.count
    })
}
// --------------------------- Follow Functions -------------------------//
function checkMemberIsAuthor(id) {
  fetch(`/api/check_member_is_author/${id}`)
    .then(response => response.json())
    .then(data => {
      if (data.member_is_author) {
        document.getElementById('follow-btns').style.display = 'none'
      }
    })
}
function checkFollowingStatus(id) {
  // Updates the buttons when first rendered based on information in the db.
  fetch(`/api/check_following_status/${id}`)
    .then(response => response.json())
    .then(data => {
      if (data.following) {
        document.getElementById('follow-me').disabled = true
        document.getElementById('unfollow-me').disabled = false
      } else {
        document.getElementById('follow-me').disabled = false
        document.getElementById('unfollow-me').disabled = true
      }
    })
  console.log('end of fetch stmt checkFollowingStatus')
}
function get_user_to_follow() {
  // Called by listener when 'like-me' button is clicked
  button = document.getElementById('follow-me')
  button.disabled = true
  document.getElementById('unfollow-me').disabled = false
  id = button.data_id
  console.log('button data-id' + id)
  fetch(`/api/update_following/${id}`).then(update_follow_data)
}
function get_user_to_unfollow() {
  // Called by listener when 'like-me' button is clicked
  button = document.getElementById('follow-me')
  button.disabled = false
  document.getElementById('unfollow-me').disabled = true
  id = button.data_id
  console.log('button data-id' + id)
  fetch(`/api/update_unfollowing/${id}`).then(update_follow_data)
}
function update_follow_data() {
  id = document.getElementById('follow-me').data_id
  fetch(`/api/follow_counts/${id}`)
    .then(response => response.json())
    .then(data => {
      this_user_is_following = data.following
      this_user_has_followers = data.followers
      document.getElementById('following').textContent =
        'Following: ' + this_user_is_following
      document.getElementById('followed-by').textContent =
        'Followed by: ' + this_user_has_followers
    })
}

// --------------------------- Helper Functions -------------------------//

function username_format(username) {
  s1 = username
  s2 = s1.replace(/_/g, ' ')
  s3 = s2.split(' ')
  s4 = s3.map(item => {
    return item.charAt(0).toUpperCase() + item.slice(1)
  })
  s5 = s4.join(' ')
  return s5
}
function toggle_likes() {
  button = document.getElementById('like-me')
  if ((button.disabled = true)) {
    button.disabled = false
    document.getElementById('unlike-me').disabled = true
  } else {
    button.disabled = true
    document.getElementById('unlike-me').disabled = false
  }
}
function toggle_follow() {
  button = document.getElementById('follow-me')
  if ((button.disabled = true)) {
    button.disabled = false
    document.getElementById('follow-me').disabled = true
  } else {
    button.disabled = true
    document.getElementById('follow-me').disabled = false
  }
}
function show_all_posts_view() {
  document.querySelector('#welcome').style.display = 'block'
  document.querySelector('#all-posts').style.display = 'block'
  document.querySelector('#post_lists').style.display = 'block'
  document.querySelector('#profile').style.display = 'none'
  document.querySelector('#profile-posts').style.display = 'none'
  document.querySelector('#single-post').style.display = 'none'
  document.querySelector('#member-posts').style.display = 'none'
  document.querySelector('#filtered-posts').style.display = 'none'
}
function show_profile_view() {
  document.querySelector('#welcome').style.display = 'block'
  document.querySelector('#post_lists').style.display = 'none'
  document.querySelector('#profile-posts').style.display = 'block'
  document.querySelector('#profile').style.display = 'block'
  document.querySelector('#single-post').style.display = 'none'
  document.querySelector('#member-posts').style.display = 'none'
  document.querySelector('#follow-btns').style.display = 'block'
  if (!memberName) {
    document.querySelector('#follow-btns').style.display = 'none'
  }
}
function show_single_post_view() {
  document.querySelector('#welcome').style.display = 'none'
  document.querySelector('#post_lists').style.display = 'none'
  document.querySelector('#profile-posts').style.display = 'none'
  document.querySelector('#profile').style.display = 'none'
  document.querySelector('#single-post').style.display = 'block'
  document.querySelector('#member-posts').style.display = 'none'
  if (!memberName) {
    document.querySelector('#like-btns').style.display = 'none'
    document.querySelector('#edit_post_btn').style.display = 'none'
  }
  document.getElementById('edit_post').innerHTML = ''
}
function show_member_post_view() {
  document.querySelector('#welcome').style.display = 'block'
  document.querySelector('#post_lists').style.display = 'none'
  document.querySelector('#profile-posts').style.display = 'none'
  document.querySelector('#profile').style.display = 'none'
  document.querySelector('#single-post').style.display = 'none'
  document.querySelector('#member-posts').style.display = 'block'
}
function show_filtered_posts_view() {
  load_filtered_feed()
  document.querySelector('#welcome').style.display = 'none'
  document.querySelector('#all-posts').style.display = 'none'
  document.querySelector('#profile-posts').style.display = 'none'
  document.querySelector('#profile').style.display = 'none'
  document.querySelector('#single-post').style.display = 'none'
  document.querySelector('#member-posts').style.display = 'none'
  document.querySelector('#follow-btns').style.display = 'none'
  document.querySelector('#filtered-posts').style.display = 'block'
}
