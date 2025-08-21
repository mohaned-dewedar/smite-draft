const fs = require('fs')
const path = require('path')

const srcPath = path.resolve(__dirname, '../src/data/gods_merged.json')
const outJson = path.resolve(__dirname, '../src/data/gods_merged_local.json')
const assetsDir = path.resolve(__dirname, '../public/assets/gods')
if(!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, {recursive:true})

const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'))

function svgFor(name){
  const short = name.length>18 ? name.slice(0,15)+'...' : name
  const bgColors = ['#1f2937','#075985','#7c3aed','#0ea5a4','#ef4444','#f59e0b','#10b981','#06b6d4']
  const bg = bgColors[Math.abs(name.split('').reduce((a,c)=>a + c.charCodeAt(0),0)) % bgColors.length]
  const textColor = '#fff'
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">\n  <rect width="100%" height="100%" fill="${bg}"/>\n  <text x="50%" y="50%" font-family="Inter, Arial, Helvetica, sans-serif" font-size="26" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${escapeXml(short)}</text>\n</svg>`
}

function escapeXml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&apos;')
}

const out = data.map(g => {
  const safe = g.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()
  const filename = `${safe}.svg`
  const dest = path.join(assetsDir, filename)
  fs.writeFileSync(dest, svgFor(g.name), 'utf8')
  return {...g, imageUrl: `/assets/gods/${filename}`}
})

fs.writeFileSync(outJson, JSON.stringify(out, null, 2), 'utf8')
console.log('Wrote', outJson, 'and', out.length, 'svg files to', assetsDir)
