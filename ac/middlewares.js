const Router = require('@koa/router')
const scraper = require('./scraper').default
const _ = new Router()
_.post('/update', async (ctx, next) => {
  const token = ctx.request.header['x-zerob13-token']
  // console.log(token)
  // console.log(ctx.request.header)
  if (token && token.indexOf('hahaha') >= 0) {
    scraper.update().then(result => {
      console.log(result)
    })
    ctx.body = { code: 200, data: 'done,wait for 3 mins to see new data' }
  } else {
    ctx.body = { code: 401, data: 'no access permissions' }
  }
  await next()
})
_.get('/:hemisphere/:type', async (ctx, next) => {
  const h = ctx.params.hemisphere
  const type = ctx.params.type
  const result = await scraper.prepareDB().then(db => {
    return new Promise((resolve, reject) => {
      db.collection(`${h}_${type}`)
        .find({})
        .sort({ Name: 1 })
        .toArray((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
    })
  })
  ctx.body = {
    code: 200,
    data: result
  }
  await next()
})

exports.default = [_.routes(), _.allowedMethods()]
