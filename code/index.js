const path = require('path')
const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs');
const os = require('os')

function asyncHttps(url) {
  return new Promise(resolve => {
    https.get(url, (res) => {
      resolve(res)
    })
  })
}

async function downloadPnpm(client, version, arch) {
  const defaultUrl = `https://github.com/pnpm/pnpm/releases/download/${version}/${arch}`
  const pnpmRes = await asyncHttps(defaultUrl)
  let realPnpmUrl = ''
  switch (pnpmRes.statusCode) {
    case 200:
      realPnpmUrl = defaultUrl
      break;
    case 302:
      realPnpmUrl = pnpmRes.headers.location
      break;
  }
  const pnpmStreamRes = await asyncHttps(realPnpmUrl)
  pnpmStreamRes.pipe(client)
}

const router = express.Router()

router.get('/:version/:arch', async (req, res) => {
  if (req.params.arch && req.params.version) {
    await downloadPnpm(res, req.params.version, req.params.arch)
  } else {
    res.end('file not found')
  }
})

// 解决脚本中curl head验证请求
router.head('/:version/:arch', (req, res) => {
  res.end('success')
})

const scriptPath = path.join(__dirname, './script')
app.get('/install.sh', (req, res) => {
  const shScript = fs.createReadStream(path.join(scriptPath, 'install.sh'))
  shScript.pipe(res)
})

app.get('/install.ps1', (req, res) => {
  const shScript = fs.createReadStream(path.join(scriptPath, 'install.ps1'))
  shScript.pipe(res)
})

app.use('/pnpm/pnpm/releases/download', router)

app.listen(9000, () => {
  console.log('http://localhost:9000')
})
