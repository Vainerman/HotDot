FROM postgres:15-alpine

# Example of customizing the image
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ../init_db/schema.sql /docker-entrypoint-initdb.d/
