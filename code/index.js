const path = require('path')
const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs');
const os = require('os')
const fileStream = fs.createWriteStream(path.join(os.tmpdir(), 'pnpm-linux-x64'), {
  flags: 'w'
})

function downloadPnpm(httpRes, version, arch) {
  return new Promise((resolve) => {
    https.get(`https://github.com/pnpm/pnpm/releases/download/${version}/${arch}`, (response) => {
      response.pipe(httpRes);
      response.on('error', (err) => console.log(err))
      response.on('close', () => {
        resolve()
      })
    });
  })
}

const router = express.Router()

router.get('/:version/:arch', async (req, res) => {
  if (req.params.arch && req.params.version) {
    res.setHeader('Content-Disposition', `attachment; filename="pnpm-linux-x64"`);
    res.setHeader('Access-Control-Allow-Headers', '*')
    await downloadPnpm(res, req.params.version, req.params.arch)
  } else {
    res.end('file not found')
  }
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
