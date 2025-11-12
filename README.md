# Network Project
This project is intended to replicate much of the functionality of a e-commerce site. It uses Django models, model forms, views and templates to create an interactive user application. Users can sign in & log out, upload listings, watch listings, bid on listings, comment on listings, and see various lists or reports regarding their listings.
This project is intended to replicate much of the functionality of a social network site.  It uses Djando models, model forms, views, and templates to create an interactive user application. This application has been designed as a Single Page Application (SPA).  I initially designed it to leverage React, but was not able to implement and refactor with the timeline. 
The primary goal is to create a platform where users can register, log in, make text-based posts, follow other users and like other posts.  
## Key specifications:
* Content display: Implemented pages for users and guests that are not signed in including lists of posts by the author, links to the author's bio, and links to the post.  Requirements asked that the posts be ordered most recent first.  Because I have designed this application to sort by author, the posts are first ordered by author, then by date. 
* Member displays: In addition to the public views, when a user is logged in, they are allowed to follow other users, see posts by the authors that they follow, like posts and edit their own posts. 
* Pagination: The posts can be lengthy and pagination has been added in all areas where posts are listed.  Aspects such as displaying the navigation buttons only when needed were implemented to enhance the user experience. 
* Asynchronous Functionality: As this is a SPA, there are many examples of using JavaScript asynchronously (use of fetch), changing posts, updating the like and following counts etc. 

## Assistance in completing this project
In addition to the samples and lecture notes from professors, I utilized various websites and the CS50AI duck to develop this project. I did use CoPilot to provide sample data. 
The primary sites I used: -https://www.w3schools.com/ -https://docs.djangoproject.com/en/5.2/ -https://getbootstrap.com/docs/5.3/ -https://developer.mozilla.org/

Additional Sites: 
* https://www.pythontutorial.net/django-tutorial/django-many-to-many/
* https://www.geeksforgeeks.org/python/associate-user-to-its-upload-post-in-django/
* https://docs.djangoproject.com/en/5.2/ref/models/fields/#django.db.models.ForeignKey
* https://learndjango.com/tutorials/django-custom-user-model
* https://django.pythonassets.com/docs/more-on-models-and-forms/models-and-forms/
* https://www.youtube.com/watch?v=PXqRPqDjDgc
* https://www.youtube.com/watch?v=N-PB-HMFmdo
* https://apidog.com/blog/pagination-in-rest-apis/
* https://web.dev/articles/fetch-api-error-handling

I used an online photo resizing tool: https://www.birme.net/ to help with the images. 
