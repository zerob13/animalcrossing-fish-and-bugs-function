const Router = require('@koa/router')
const scraper = require('./scraper')
const _ = new Router()
_.post('/update', async (ctx, next) => {
  const token = ctx.request.header['X-Zerob13-Token']
  if (token && token.indexOf('hahaha') >= 0) {
    const result = await scraper.update()
    ctx.body = { code: 200, data: result }
  } else {
    ctx.body = { code: 401, data: 'no access permissions' }
  }
  await next()
})
_.get('/:hemisphere/:type', async (ctx, next) => {})

exports.default = [_.routes(), _.allowedMethods()]
