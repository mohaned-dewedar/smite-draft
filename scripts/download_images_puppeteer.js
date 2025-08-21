const fs = require('fs')
const path = require('path')

const srcPath = path.resolve(__dirname, '../src/data/gods_merged.json')
const outPath = path.resolve(__dirname, '../src/data/gods_merged_local.json')
const assetsDir = path.resolve(__dirname, '../public/assets/gods')

if(!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, {recursive:true})

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'))

;(async ()=>{
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  for(const g of data){
    const safeName = g.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()
    const localSvg = path.join(assetsDir, `${safeName}.svg`)
    if(fs.existsSync(localSvg)){
      console.log(`Using local asset for ${g.name}`)
      g.imageUrl = `/assets/gods/${safeName}.svg`
      continue
    }

    if(!g.imageUrl) continue

    try{
      console.log(`Fetching ${g.name} from remote`)
      const resp = await page.goto(g.imageUrl, {timeout: 30000, waitUntil: 'networkidle2'})
      if(!resp) { console.warn('no response for', g.imageUrl); continue }
      const status = resp.status()
      if(status >= 400){ console.warn('bad status', status, 'for', g.imageUrl); continue }

      const buffer = await resp.buffer()
      const ct = resp.headers()['content-type'] || ''
      let ext = 'png'
      if(ct.includes('svg')) ext = 'svg'
      else if(ct.includes('png')) ext = 'png'
      else if(ct.includes('jpeg')) ext = 'jpg'

      const filename = `${safeName}.${ext}`
      const dest = path.join(assetsDir, filename)
      fs.writeFileSync(dest, buffer)
      console.log(`Wrote ${dest}`)
      g.imageUrl = `/assets/gods/${filename}`
    }catch(err){
      console.error('failed to fetch', g.imageUrl, err && err.message)
    }
  }

  await browser.close()
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Wrote', outPath)
})()
