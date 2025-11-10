from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ModelForm

# extending the attributes and methods from the Abstract user into a custom User model.


class User(AbstractUser):
    following = models.ManyToManyField(
        "User", verbose_name=("following_users"), related_name="followings")
    followed_by = models.ManyToManyField(
        "User", verbose_name=("followed_by_users"), related_name="followers")
    bio = models.TextField(null=True)
    image = models.ImageField(upload_to='profile_pics',
                              height_field=None,
                              width_field=None,
                              max_length=100,
                              null=True)
    joinDate = models.DateTimeField(auto_now_add=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "start_date": self.date_joined.strftime("%b %d %Y, %I:%M %p"),
            "bio": self.bio,
            "profile_pic": self.image.url,
            "followers": self.count_followers(),
            "following": self.count_following()
        }

    def get_id(self):
        return self.get_id

    def get_followers(self):
        return self.followed_by.all()

    def count_followers(self):
        return self.followed_by.count()

    def get_following(self):
        return self.following.all()

    def count_following(self):
        return self.following.count()

    # Shows the username in Admin instead of object #
    def __str__(self):
        return self.username


# Class or Model definition for Posts.
class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField(null=True)
    create_date = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey("User",
                                   on_delete=models.CASCADE,
                                   related_name="posts",
                                   related_query_name="post",)
    member_likes = models.ManyToManyField(User, related_name="post_likes")

    class Meta:
        ordering = ('-create_date',)
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'

    # Shows the title in Admin instead of object #

    def __str__(self):
        return self.title

    # gets a dictionary of key-value pairs of attributes in the object
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "create_date": self.create_date.strftime("%m/%d/%Y"),
            "created_by": self.created_by.username,
            "created_by_id": self.created_by.id,
            "likes": self.likes,
            "profile_pic": self.created_by.image.url
        }

    # gets an array of post objects by the user
    def posts_by_user(self):
        my_created_by = self.created_by
        my_posts = Post.objects.all().filter(created_by=my_created_by)
        return my_posts

    # gets a list of ids of posts by the user
    def posts_ids_by_user(self):
        my_post_list = self.array_posts_by_user().values_list('id')
        return my_post_list

    def like(self):
        new_like = self.likes + 1
        self.likes = new_like
        self.save()
        return self.likes

    def unlike(self):
        if self.likes > 0:
            subtract_like = self.likes - 1
            self.likes = subtract_like
        self.save()
        return self.likes
