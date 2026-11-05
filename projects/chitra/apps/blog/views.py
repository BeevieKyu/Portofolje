from django.shortcuts import render, get_object_or_404
from .models import Blog
from django.utils.html import strip_tags
from html import unescape

def blog(request):
    post = Blog.objects.all().order_by('-id')

    return render(request, 'core/blog.html', {'post': post})

def blog_post(request, id, slug):
    post_info = get_object_or_404(Blog, id=id, slug=slug) 

    post_text = strip_tags(unescape(post_info.text))

    return render(request, 'core/blog-post.html', {'post_info':post_info, 'post_text':post_text,})
