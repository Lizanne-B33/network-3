from django import forms
from .models import Post

# ------------------------------------
# Model Forms
# ------------------------------------

# Create form class named PostForm


class PostForm(forms.ModelForm):
    # defines metadata for AddPostForm
    class Meta:
        model = Post
        fields = ["title", "body"]

    # Customize Initialization of PostForm
    def __init__(self, *args, **kwargs):
        # call parent class (PostForm) __init__ method
        super().__init__(*args, **kwargs)

    # Updates the HTML attributes of the widget
    # Adds a CSS class called "form-control" and
    # sets a place holder Enter + field name.
    # using Underscore as the variable bc the loop variable
    # is not what is needed, only something to iterate.
        for _, field in self.fields.items():
            field.widget.attrs.update({
                "class": "form-control",
                "placeholder": f"Enter {field.label}"
            })

# ------------------------------------
# Forms
# ------------------------------------


class EditForm(forms.Form):
    body = forms.CharField(
        label='Edit your post',
        widget=forms.Textarea(attrs={
            'rows': 4,
            'cols': 40,
            'class': 'form-control',
            'placeholder': 'Update your post here...'
        }),
        max_length=1000
    )
