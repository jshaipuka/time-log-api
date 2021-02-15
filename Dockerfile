FROM postgres:13
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD postgres
ENV POSTGRES_DB time_management
RUN apt-get update && apt-get install -y postgresql-13 postgresql-client-13 postgresql-contrib-13
