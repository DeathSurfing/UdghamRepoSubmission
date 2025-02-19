# pythonscripts/Dockerfile
FROM python:3.10
WORKDIR /pythonscripts
COPY requirements.txt ./
RUN python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
COPY . .
CMD ["/bin/sh", "-c", "tail -f /dev/null"]
