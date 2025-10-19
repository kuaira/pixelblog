from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField(read_only=True)

    def get_author(self, obj):
        return obj.author.username if getattr(obj, "author", None) else None

    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'author', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')
