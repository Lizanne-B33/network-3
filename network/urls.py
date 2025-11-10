
from django.urls import path
import network.views as views
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("add_post", views.add_post, name="add_post"),

    # API Routes
    path("api/feed/<int:page>", views.feed, name='api_feed'),
    path("api/single_profile/<id>", views.single_profile, name="single_profile"),
    path("api/single_feed/<str:created_by>/<int:page>",
         views.single_feed, name="api_single_feed"),
    path("api/single_post/<id>", views.single_post, name="api_single_post"),
    path("api/check_like_status/<int:id>",
         views.check_like_status, name="check_like_status"),
    path("api/update_likes/<int:id>", views.update_likes, name="update_likes"),
    path("api/update_unlikes/<int:id>",
         views.update_unlikes, name="update_unlikes"),
    path("api/count_likes/<int:id>", views.count_likes, name="count_likes"),
    path("api/update_following/<int:id>",
         views.update_following, name="update_following"),
    path("api/update_unfollowing/<int:id>",
         views.update_unfollowing, name="update_unfollowing"),
    path("api/check_member_is_author/<int:id>",
         views.check_member_is_author, name="check_member_is_author"),
    path("api/check_following_status/<int:id>",
         views.check_following_status, name="check_following_status"),
    path("api/follow_counts/<int:id>", views.follow_counts, name="follow_counts"),
    path("api/filtered_feed", views.filtered_feed, name="filtered_feed"),
    path("api/display_edit/<int:id>", views.display_edit, name="display_edit"),
    path("api/check_member_profile_is_member/<int:id>",
         views.check_member_profile_is_member, name="check_member_profile_is_member")

]
# Image files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
