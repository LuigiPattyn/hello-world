FROM python:3.12-slim

WORKDIR /app

# Copy only what the server needs.
COPY server.py .

# Run as a non-root user for a slightly safer container.
RUN useradd --create-home --uid 1001 appuser
USER appuser

EXPOSE 8000

CMD ["python3", "-u", "server.py"]
