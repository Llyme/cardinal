# Cardinal

Cardinal is a web-based tool for managing Kubernetes clusters with a clean, modern interface built on FastAPI and Next.js.

## 🌟 Features

-   **Cluster Management**: View and manage Kubernetes nodes, pods, and deployments
-   **Pod Operations**: Get logs, restart, and delete pods across namespaces
-   **Deployment Control**: Restart deployments with ease
-   **Authentication**: Secure access with JWT-based authentication
-   **Real-time Monitoring**: Health checks and status monitoring
-   **Web Interface**: Modern frontend built with Next.js
-   **Rate Limiting**: Built-in API rate limiting for stability
-   **Docker Support**: Fully containerized for easy deployment

## 🚀 Quick Start

### Prerequisites

-   Docker and Docker Compose
-   Kubernetes cluster access (kubeconfig)
-   Python 3.8+ (for local development)

### Using Docker Compose (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd cardinal
```

2. Create a `.env` file with your configuration:

```bash
cp .env.example .env
# Edit .env with your settings
```

3. Ensure your kubeconfig is available at `~/.kube/config`

4. Start the application:

```bash
docker-compose up -d
```

5. Access the application at `http://localhost:8000`

### Local Development

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Install kubectl and ensure it's configured for your cluster

3. Start the development server:

```bash
fastapi run main.py --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once running, you can access:

-   **Interactive API docs**: `http://localhost:8000/api/docs`
-   **ReDoc documentation**: `http://localhost:8000/api/redoc`

## 🔧 Configuration

Cardinal uses environment variables for configuration. Key settings include:

-   **Authentication settings**: JWT secret keys and token expiration
-   **Kubernetes settings**: Cluster access and namespace filtering
-   **Rate limiting**: API request limits per client

## 🛠️ Tech Stack

### Backend

-   **FastAPI**: Modern, fast web framework for building APIs
-   **Python 3.8+**: Core language
-   **Kubernetes Python Client**: For cluster interaction
-   **JWT Authentication**: Secure user sessions
-   **Slowapi**: Rate limiting middleware
-   **Loguru**: Enhanced logging

### Frontend

-   **Next.js**: React-based web framework
-   **Static serving**: Integrated with FastAPI

### Infrastructure

-   **Docker**: Containerization
-   **kubectl**: Kubernetes command-line tool
-   **Ubuntu 22.04**: Base container image

## 🏗️ Project Structure

```
cardinal/
├── main.py                 # FastAPI application entry point
├── routes/                 # API route handlers
│   ├── auth.py            # Authentication endpoints
│   ├── root.py            # Main cluster operations
│   ├── health.py          # Health check endpoints
│   ├── logs.py            # Pod log endpoints
│   ├── restart.py         # Restart operations
│   └── delete.py          # Delete operations
├── models/                 # Pydantic data models
├── helpers/                # Utility functions and classes
├── screen/                 # Frontend Next.js application
├── secret/                 # Configuration and secrets
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Container build instructions
└── requirements.txt       # Python dependencies
```

## 🔐 Security

-   JWT-based authentication for API access
-   Rate limiting to prevent abuse
-   CORS configuration for frontend integration
-   Secure handling of Kubernetes credentials

## 📊 Health Monitoring

Cardinal includes built-in health checks:

-   Application health endpoint: `/api/health`
-   Docker health checks with automatic restarts
-   Kubernetes cluster connectivity verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `/api/docs`
2. Review the application logs
3. Ensure kubectl access to your cluster
4. Verify environment configuration

---

**Version**: 0.0.1

Built with ❤️ for Kubernetes cluster management.
