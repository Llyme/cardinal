# As Scrapy runs on Python, I choose the official Python 3 Docker image.
# FROM python:3.8.10-alpine
# FROM python:3.10-slim
# FROM bitnami/kubectl:latest
FROM ubuntu:22.04


ARG CLIENT_KEY
ARG SERVER_CA
ARG CLIENT_CRT

ENV PYTHONUNBUFFERED 1

# RUN apt update && apt-get install -y \
#     python3-pip \
#     curl \
#     && rm -rf /var/lib/apt/lists/*
    
RUN apt update
RUN apt-get install -y python3-pip curl
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

# Download kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make kubectl executable
RUN chmod +x kubectl

# Move kubectl to /usr/local/bin
RUN mv kubectl /usr/local/bin/

# Verify installation
RUN kubectl version --client

# RUN chmod +x secret/deploy.sh
# RUN ./secret/deploy.sh

# RUN kubectl config use-context Net4

EXPOSE 8000

CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]