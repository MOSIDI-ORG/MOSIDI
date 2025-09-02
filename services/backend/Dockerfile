FROM python:3.11

RUN apt-get update
RUN apt-get install -y gdal-bin libgdal-dev
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN mkdir app
WORKDIR /app

ENV PATH="${PATH}:/root/.local/bin"
ENV PYTHONPATH=.

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt


COPY src/ .