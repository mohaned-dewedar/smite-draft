const fs = require('fs')
const path = require('path')

const processedPath = path.resolve(__dirname, '../src/data/gods_processed.json')
const extendedPath = path.resolve(__dirname, '../src/data/smite_gods_extended.json')
const outPath = path.resolve(__dirname, '../src/data/gods_merged.json')

function loadJson(p){
  const raw = fs.readFileSync(p, 'utf8')
  // handle files that might contain markdown-style fences
  const cleaned = raw.replace(/^```json\n|\n```$/g, '').trim()
  return JSON.parse(cleaned)
}

const processed = loadJson(processedPath)
const extended = loadJson(extendedPath)

// build name map from extended (normalize to lower-case)
const extMap = new Map()
extended.gods.forEach(g => {
  extMap.set(g.name.toLowerCase(), g)
})

function splitRoles(roleStr){
  if(!roleStr) return []
  // split on common separators and word 'and'
  const parts = roleStr.split(/\s*(?:,|\/|\\|&|;|\||\\|\band\b)\s*/i)
  return parts.map(s=>s.trim()).filter(Boolean)
}

const merged = processed.map(p => {
  const name = p.name || ''
  const lower = name.toLowerCase()
  const ext = extMap.get(lower)
  const imageUrl = ext ? ext.image_url : (p.metadata && p.metadata.image_url) || null
  const roleField = (p.metadata && p.metadata.role) || p.metadata?.roles || p.role || ''
  const roles = Array.isArray(roleField) ? roleField : splitRoles(String(roleField))

  return {
    id: p.id,
    name: p.name,
    pantheon: p.metadata?.pantheon || null,
    title: p.metadata?.title || null,
    imageUrl: imageUrl,
    role: roles,
    source_url: p.source_url || (ext && ext.profile_url) || null
  }
})

fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8')
console.log('Wrote', outPath, 'entries:', merged.length)
