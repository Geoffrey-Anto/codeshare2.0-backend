FROM node:18-alpine3.16

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENV PORT=3001

ENV DATABSE_URL=$DATABASE_URL

EXPOSE 3001

RUN npx prisma generate

CMD ["npm", "run", "dev"]