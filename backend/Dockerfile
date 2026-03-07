FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install gunicorn mysqlclient python-dotenv

COPY . /app/

RUN mkdir -p /app/staticfiles /app/media

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Fixed: nexxa_backend not nexaauto
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "nexxa_backend.wsgi:application"]
