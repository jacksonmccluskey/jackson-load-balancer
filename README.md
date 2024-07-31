# jackson-load-balancer

Simple load balancer with a round robin, try-catch approach.

1. Clone Project

```
$ git clone https://github.com/jacksonmccluskey/jackson-load-balancer.git
```

2. Install Dependencies

```
$ npm install
```

3. Configure .env File

```
NODE_ENV=TESTING
PORT=8080 # Any Port You Want

MONGODB_URL=mongodb://127.0.0.1:27017/jackson-load-balancer

JWT_SECRET=YOUR_JWT_SECRET_KEY
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=1
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

SMTP_HOST=youremailserver.com
SMTP_PORT=587
SMTP_USERNAME=you@youremailserver.com
SMTP_PASSWORD=YOUR_EMAIL_PASSWORD
EMAIL_FROM=you@youremailserver.com

API_POOLS_COLLECTION_NAME=apipools
INITIAL_API_POOL_NAME=initial
INITIAL_API_POOL_URLS=https://yourdomain1.com,https://yourdomain2.com,https://yourdomain3.com
INITIAL_API_HEALTH_CHECK_ROUTE=/i-am-healthy
HEALTH_CHECK_ENOUGH_TIME=60000
```

4. Start Production, Development, or Testing Environment w/ API & Database

```
$ npm run docker:dev
# $ npm run docker:test
# $ npm run docker:prod
```
