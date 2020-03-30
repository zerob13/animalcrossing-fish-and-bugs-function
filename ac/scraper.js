const axios = require('axios')
const cheerio = require('cheerio')
const MongoClient = require('mongodb').MongoClient
let clientsDB // cached connection-pool

const URL_LIST = [
  {
    url: 'https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)',
    type: 'bug'
  },
  {
    url: 'https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)',
    type: 'fish'
  }
]
// const BUGS_URL = 'http://localhost:8888/test.html'

function getRawData(url) {
  console.log(`start to query: `, url)
  return axios({
    method: 'get',
    url,
    responseType: 'document',
    headers: {
      referer:
        'https://animalcrossing.fandom.com/wiki/Special:Search?query=bugs',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36 Edg/80.0.361.69'
    },
    timeout: 5000
  })
    .then(response => {
      // console.log(Object.keys(response))
      return response.data
    })
    .catch(e => {
      console.error(e)
    })
}

function convertTableToJson($, $table) {
  const dataTable = $('table.sortable', $table)
  // console.log(dataTable.html())
  const trs = $('tr', dataTable)
  let jsonKeys = []
  let jsonDatas = []
  trs.each((index, item) => {
    const headers = $('th', item)
    const datas = $('td', item)
    if (headers.length > 0) {
      headers.each((tId, tItem) => {
        let text = $(tItem).text()
        text = text.trim()
        jsonKeys.push(text)
      })
    } else if (datas.length > 0) {
      let tempObj = []
      datas.each((tId, tItem) => {
        let text = $(tItem).text()

        text = text.trim()
        let result = text
        if (text === '✓') {
          result = true
        }
        if (text === '-') {
          result = false
        }
        const hasImg = $('a.image.image-thumbnail', tItem)
        if (hasImg.length > 0) {
          result = hasImg.attr('href')
        }
        tempObj.push(result)
      })
      jsonDatas.push(tempObj)
    }
  })
  let output = []
  for (let i = 0; i < jsonDatas.length; i++) {
    const item = jsonDatas[i]
    let resultObj = {}
    for (let j = 0; j < jsonKeys.length; j++) {
      resultObj[jsonKeys[j]] = item[j]
    }
    output.push(resultObj)
  }
  return output
}

function magic(url, type = 'bugs') {
  getRawData(url).then(text => {
    // console.log(text)
    const $ = cheerio.load(text)
    // const northern = $('.tabbertab[title="Northern Hemisphere"]')
    const northern = $('.tabbertab[title="Northern Hemisphere"]')
    const southern = $('.tabbertab[title="Southern Hemisphere"]')

    // console.log(northern.html())
    // console.log(southern)
    let output = convertTableToJson($, northern)
    let output2 = convertTableToJson($, southern)
    return prepareDB().then(db => {
      let nPromise = new Promise((resolve, reject) => {
        db.collections(`northern_${type}`).insertMany(
          northern,
          (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result.result.n)
            }
          }
        )
      })
      let sPromise = new Promise((resolve, reject) => {
        db.collections(`southern_${type}`).insertMany(
          southern,
          (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result.result.n)
            }
          }
        )
      })
      return Promise.all([nPromise, sPromise])
    })
  })
}
const prepareDB = () => {
  const url = `mongodb://${process.env.mongo}:27017/clients`
  return new Promise((resolve, reject) => {
    if (clientsDB) {
      console.log('already connected')
      return resolve(clientsDB)
    }
    MongoClient.connect(url, (err, database) => {
      if (err) {
        reject(err)
      }
      clientsDB = database.db('animanl')
      return resolve(clientsDB)
    })
  })
}

exports.default = {
  update: () => {
    URL_LIST.forEach(url => {
      magic(url.url, url.type)
    })
  },
  prepareDB
}
