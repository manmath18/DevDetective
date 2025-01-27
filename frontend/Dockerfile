FROM node:20-slim

WORKDIR /app1

COPY . .

RUN npm install -g http-server

EXPOSE 9563

CMD ["http-server", "-p", "9563"] 