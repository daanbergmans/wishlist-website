# The wishlist: one Node process, no npm packages to install.
FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./
COPY api ./api
COPY public ./public

# Claims and the visitor count live here; mount a persistent volume at /data.
# The folder belongs to the unprivileged "node" user, so the app can write to it without running as root.
RUN mkdir /data && chown node:node /data
ENV NODE_ENV=production DATA_DIR=/data PORT=3000
USER node

EXPOSE 3000
CMD ["node", "server.js"]
