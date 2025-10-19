from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Post
from .serializers import PostSerializer, UserSerializer

User = get_user_model()

# 自定义权限：只允许作者修改/删除，任何人可读，创建需登录
class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # 公开读取
        if request.method in permissions.SAFE_METHODS:
            return True
        # 创建需要登录
        if request.method == 'POST':
            return request.user and request.user.is_authenticated
        # 其他非安全方法需要走对象级权限判断
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # 修改/删除只能作者本人
        return bool(request.user and request.user.is_authenticated and obj.author_id == request.user.id)


class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '') or ''  # 确保email为空字符串而不是None

        # 验证必要字段
        if not username or not password:
            return Response({'detail': '用户名和密码是必填项'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查用户名是否已存在
        if User.objects.filter(username=username).exists():
            return Response({'detail': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)

        # 检查邮箱是否已存在（如果提供了邮箱）
        if email and User.objects.filter(email=email).exists():
            return Response({'detail': '邮箱已被注册'}, status=status.HTTP_400_BAD_REQUEST)

        # 创建用户（不再验证密码强度）
        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            # 生成JWT令牌
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': '注册失败，请稍后重试'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username') or request.POST.get('username')
        password = request.data.get('password') or request.POST.get('password')

        if not username or not password:
            return Response({'detail': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            u = User.objects.filter(email__iexact=username).first()
            if u:
                user = authenticate(request, username=u.username, password=password)

        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'User inactive'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-id')
    serializer_class = PostSerializer
    permission_classes = (IsAuthorOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        author = self.request.query_params.get('author')
        if author:
            if author.isdigit():
                qs = qs.filter(author__id=author)
            else:
                qs = qs.filter(author__username=author)

        # 支持按 title/content 模糊搜索 ?search=关键词
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(content__icontains=search))

        return qs