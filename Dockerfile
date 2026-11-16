FROM python:3.13-slim
WORKDIR /app
COPY server.py ./
COPY dist ./dist
ENV HOST=0.0.0.0 PYTHONUNBUFFERED=1
CMD ["python", "server.py"]
