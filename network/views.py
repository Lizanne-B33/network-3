import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render, redirect, get_object_or_404
from django.urls import reverse
from .models import User, Post
from .forms import PostForm, EditForm

# ---------------------------------------------
# User Login/Logout Functions
# ---------------------------------------------


def index(request):
    form = PostForm()
    memberName = ""
    # Authenticated users view their their Posts and can enter a new post
    if request.user.is_authenticated:
        memberName = request.user.username
        return render(request, "network/index.html", {'form': form, 'memberName': memberName})
    # Everyone else can see the existing posts, and invited to register/sign in.
    else:
        return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    username = ""
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

# ---------------------------------------------------------------
# A logged in user (member of the Social Network) can
# Add new posts, # Edit their own posts, and like anyone's posts.
# ---------------------------------------------------------------


@csrf_exempt
@login_required
def add_post(request):
    # Add Post: Sets up the Form Model for a new post
    if request.method == 'POST':
        # Bind user input to the form
        form = PostForm(request.POST)
        # Server-side Validation
        if form.is_valid():
            my_title = form.cleaned_data['title']
            my_body = form.cleaned_data['body']
            # create the post object
            new_post = Post(title=my_title,
                            body=my_body,
                            created_by=request.user,
                            likes=0)
            new_post.save()
            return HttpResponseRedirect(reverse('index'))
    else:
        form = PostForm()
    return render(request, "network/index.html", {'form': form})

# Edit Post: uses an Edit Button that is only displayed if the
# Member is viewing their own post.  This edit button enables
# the member to modify and save their own post.

# EDIT


def display_edit(request, id):
    try:
        post = get_object_or_404(Post, id=id)

        if request.method == 'POST':
            form = EditForm(request.POST)
            if form.is_valid():
                post.body = form.cleaned_data['body']
                post.save()
                return JsonResponse({
                    'message': 'Post updated',
                    'updated_post': {
                        'id': post.id,
                        'body': post.body
                    }
                })
            return JsonResponse({'errors': form.errors}, status=400)

        # For GET: render the form with initial data
        form_html = render_to_string('network/partials/edit_form.html', {
            'formEdit': EditForm(initial={'body': post.body}),
            'post': post
        }, request=request)
        return JsonResponse({'form_html': form_html})

    except Exception as error:
        print('Error in display_edit:', error)
        return JsonResponse({'error': str(error)}, status=500)


def check_member_profile_is_member(request, id):
    profile_is_member = False
    if request.user.is_authenticated:
        member = request.user
        profile = Post.objects.get(id=id)
        profile_is_member = False
        if (member.id == profile.id):
            profile_is_member = True
    return JsonResponse({"profile_is_member": profile_is_member})

# ---------------------------------------------------------------
# Like functionality: logged in user can like or unlike a post
# ---------------------------------------------------------------


def check_like_status(request, id):
    # Used when form is first rendered to set the buttons.
    post = Post.objects.get(id=id)
    liked = request.user in post.member_likes.all()
    return JsonResponse({'liked': liked})


def update_likes(request, id):
    # Gets the post object and adds the M2M value for this user.
    # Also calls the model function to update the count of likes for this post.
    post = get_object_or_404(Post, id=id)
    post.member_likes.add(request.user)
    post.save()
    post.like()
    return HttpResponseRedirect(reverse('index'))


def update_unlikes(request, id):
    # Gets the post object and removes the M2M value for this user.
    # Also calls the model function to update the count of likes for this post.
    post = get_object_or_404(Post, id=id)
    post.member_likes.remove(request.user)
    post.save()
    post.unlike()
    return HttpResponseRedirect(reverse('index'))


def count_likes(request, id):
    # Gets the count from the DB and sends to the JS to update the page
    post = get_object_or_404(Post, id=id)
    count = post.likes
    return JsonResponse({'count': count})


# ---------------------------------------------------------------
# Any user (logged in or not) can view all posts
# Must be in chronological order.  Most recent first.
# I added a grouping by author.
# I intentionally added only the title to be displayed on the list
# I added a nice view of the full post that mimics a social media post.
# This view is accessed when the user clicks on the post title.
# ---------------------------------------------------------------
def feed(request, page):
    print(f'page is {page}')
    # added id to make certain there are no duplicates
    # caching to avoid misalignment.
    posts = list(Post.objects.order_by("created_by", "-create_date", "-id"))
    start = (page - 1) * 10
    end = page * 10
    p_posts = posts[start:end]

    print(f"Page {page}: {[post.id for post in p_posts]}")
    return JsonResponse([post.serialize() for post in p_posts], safe=False)


# ---------------------------------------------------------------
# Any user (logged in or not) can view the member's profile
# This is activated by clicking on the member's name from the list in all posts.
# The profile displays the number of followers, and followed by users.
# All of the user's posts are displayed in reverse chronological order.
# ---------------------------------------------------------------
def single_profile(request, id):
    # Creates the profile that the user sees when clicking on a user name.
    # Query for requested User
    try:
        member = User.objects.get(id=id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Profile not found."}, status=404)

    # Return User contents
    if request.method == "GET":
        return JsonResponse(member.serialize())


def single_feed(request, created_by, page):
    # collects the data for the posts that were created by that user.
    # since created by is a FK, I need to look up the User object by user name then filter by the user.
    print('Created by passed to function: ' + str(created_by))

    user = get_object_or_404(User, username=created_by)

    print('UserName used in filter: ' + str(user))

    posts = Post.objects.filter(created_by=user).order_by("create_date", "id")
    if posts:
        posts = list(posts)
        start = (page - 1) * 10
        end = page * 10
        p_posts = posts[start:end]
        return JsonResponse([post.serialize() for post in p_posts], safe=False)
    else:
        return JsonResponse({"text": "You don't have any posts yet."})


def single_post(request, id):
    # Query for requested Post
    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Return Post contents
    if request.method == "GET":
        return JsonResponse(post.serialize())


def profiles(request):
    # Pulls all users.
    members = User.objects
    members = User.order_by("username").all()
    return JsonResponse([User.serialize() for member in members], safe=False)
# ---------------------------------------------------------------
# Logged in users (members) can choose to follow another member.
# This will give the members a page/view where they can see a
# list of posts limited to only the members that they follow.
# A member can not follow themselves.
# ---------------------------------------------------------------

# FOLLOW: Manage Buttons & functionality


def check_member_is_author(request, id):
    member = request.user
    author = User.objects.get(id=id)
    member_is_author = False
    if (member.id == author.id):
        member_is_author = True
    return JsonResponse({"member_is_author": member_is_author})


def check_following_status(request, id):
    # Used when form is first rendered to set the buttons.
    user = User.objects.get(id=id)
    following = request.user in user.followed_by.all()
    print('following: ' + str(following))
    return JsonResponse({'following': following})


def update_following(request, id):
    # Gets the User object and adds the M2M value for this user.
    member = get_object_or_404(User, id=id)
    member.followed_by.add(request.user)
    member.save()

    # Update the following:
    this_user = get_object_or_404(User, id=request.user.id)
    this_user.following.add(member)
    this_user.save()

    return HttpResponseRedirect(reverse('index'))


def update_unfollowing(request, id):
    # Gets the user object and adds the M2M value for this user.
    # Also calls the model function to update the count of likes for this post.
    member = get_object_or_404(User, id=id)
    member.followed_by.remove(request.user)
    member.save()

    # Update the following:
    this_user = get_object_or_404(User, id=request.user.id)
    this_user.following.remove(member)
    this_user.save()
    return HttpResponseRedirect(reverse('index'))


def follow_counts(request, id):
    # Gets the count from the DB and sends to the JS to update the page
    this_member = get_object_or_404(User, id=id)
    this_member_is_following = this_member.count_following()
    this_member_has_followers = this_member.count_followers()
    return JsonResponse({'following': this_member_is_following, 'followers': this_member_has_followers})

# FOLLOW: see posts from the folks that the user follows.


def filtered_feed(request, page):
    # step 1 get the users that are being followed.
    followed_users = request.user.get_following()
    print(f' registered user is: {request.user}')
    print(f'page is {page}')
    print(f'followed users are {followed_users}')

    # step 2: get the posts from those users.
    # https://docs.djangoproject.com/en/5.2/ref/models/querysets/
    # https://www.w3schools.com/django/django_queryset_filter.php
    posts = Post.objects.filter(created_by__in=followed_users).order_by(
        "created_by", "create_date")

    # step 3: create the json
    serialized_posts = [post.serialize() for post in posts]

    # step 4: Return the json
    return JsonResponse(serialized_posts, safe=False)


# ---------------------------------------------------------------
# Pagination:
# Pagination should be deployed on any page displaying posts.
# Limit is set to 10 posts with next/previous buttons when
# the number of posts is greater than 10.
# ---------------------------------------------------------------
# Pagination - TODO
