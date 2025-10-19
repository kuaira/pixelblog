# 博客项目

这是一个使用Django和Vue.js构建的全栈博客应用，包含后端API和前端用户界面。

## 项目结构

```
.
├── backend/          # Django后端
│   ├── blog_app/     # 主要应用
│   └── blog_project/ # 项目配置
└── frontend/         # Vue前端
    └── blog_frontend/ # 前端应用
```

## 技术栈

### 后端 (Django)
- Django 4.2
- Django REST Framework
- Django REST Framework SimpleJWT (JWT认证)
- SQLite (默认数据库)

### 前端 (Vue.js)
- Vue 3
- Vite
- Element Plus (UI组件库)
- Vue Router (路由)
- Pinia (状态管理)
- Axios (HTTP客户端)

## 功能特性

1. 用户认证 (注册/登录)
2. JWT Token认证
3. 文章管理 (创建/编辑/删除/查看)
4. 响应式设计
5. Markdown支持

## 开发环境搭建

### 后端环境

1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 创建虚拟环境并激活：
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

4. 数据库迁移：
   ```bash
   python manage.py migrate
   ```

5. 创建超级用户（可选）：
   ```bash
   python manage.py createsuperuser
   ```

6. 启动开发服务器：
   ```bash
   python manage.py runserver
   ```

### 前端环境

1. 进入前端目录：
   ```bash
   cd frontend/blog_frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署

### 构建前端

```bash
cd frontend/blog_frontend
npm run build
```

构建后的文件将位于 `dist` 目录中。

### 部署后端

可以使用Django的部署方式，配合Nginx和Gunicorn等工具进行部署。

## API接口

- 注册: `POST /api/register/`
- 登录: `POST /api/login/`
- 用户信息: `GET /api/me/`
- 文章列表: `GET /api/posts/`
- 文章详情: `GET /api/posts/{id}/`
- 创建文章: `POST /api/posts/`
- 更新文章: `PUT /api/posts/{id}/`
- 删除文章: `DELETE /api/posts/{id}/`

## 许可证

本项目仅供学习和参考使用。