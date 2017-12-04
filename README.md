# Koa-content-filter
<span>[![Build Status](https://travis-ci.org/efkan/content-filter.svg?branch=master)](https://travis-ci.org/efkan/content-filter)</span>

A third-party middleware for Koa to prevent NoSQL injection.

This is a improved version from efkan's [content-filter](https://github.com/efkan/content-filter) to adapt koa-ecosystem.So, you can find more infomations there.

### Usage

```
const filter = require('koa-content-filter');

app.use(filter());
```

Then, if anyone send a request with blackblist(url or body) words like `$` will recive :

```
{
    "status": 403,
    "code": "FORBIDDEN_CONTENT",
    "message": "A forbidden expression has been found in URL: $"
}
```