const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { URL } = require('url')

const srcPath = path.resolve(__dirname, '../src/data/gods_merged.json')
const outPath = path.resolve(__dirname, '../src/data/gods_merged_local.json')
const assetsDir = path.resolve(__dirname, '../public/assets/gods')

if(!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, {recursive:true})

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'))

function download(url, dest, redirects = 0){
  return new Promise((resolve, reject)=>{
    if(!url) return resolve(null)
    if(redirects > 6) return resolve(null)

    let parsed
    try{ parsed = new URL(url) } catch(e){ return resolve(null) }

    const mod = parsed.protocol === 'https:' ? https : http
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': parsed.origin || 'https://wiki.smite2.com/'
      }
    }

    const req = mod.get(parsed.toString(), options, res =>{
      // handle redirects
      if(res.statusCode >= 300 && res.statusCode < 400 && res.headers.location){
        const loc = new URL(res.headers.location, parsed).toString()
        res.resume()
        console.error(`redirect ${url} -> ${loc}`)
        return resolve(download(loc, dest, redirects+1))
      }

      if(res.statusCode >= 400){
        console.error(`HTTP ${res.statusCode} for ${url}`)
        res.resume()
        return resolve(null)
      }

      const file = fs.createWriteStream(dest)
      res.pipe(file)
      file.on('finish', ()=> file.close(()=> resolve(true)))
      file.on('error', err => { console.error('write error', err); try{ file.close(); fs.unlinkSync(dest) }catch(e){}; resolve(null) })
    })

    req.on('error', err => { console.error('request error', err); resolve(null) })
    req.setTimeout(15000, ()=>{ console.error('request timeout', url); req.abort(); resolve(null) })
  })
}

;(async ()=>{
  for(const g of data){
    const safeName = g.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()
    // prefer existing local SVGs (already in public/assets/gods)
    const localSvg = path.join(assetsDir, `${safeName}.svg`)
    if(fs.existsSync(localSvg)){
      console.log(`Using local asset for ${g.name} -> ${safeName}.svg`)
      g.imageUrl = `/assets/gods/${safeName}.svg`
      continue
    }

    const ext = (g.imageUrl && g.imageUrl.split('?')[0].split('.').pop()) || 'png'
    const filename = `${safeName}.${ext}`
    const dest = path.join(assetsDir, filename)
    process.stdout.write(`Downloading ${g.name} -> ${filename} ... `)
    const ok = await download(g.imageUrl, dest)
    if(!ok){
      console.log('failed, leaving remote url')
      // leave imageUrl as-is
    } else {
      console.log('ok')
      g.imageUrl = `/assets/gods/${filename}`
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Wrote', outPath)
})()
