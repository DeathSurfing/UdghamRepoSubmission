# pythonscripts/Dockerfile
FROM python:3.10
WORKDIR /pythonscripts
COPY requirements.txt ./
RUN python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
COPY . .
CMD ["/bin/sh", "-c", "tail -f /dev/null"]
