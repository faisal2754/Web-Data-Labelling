// const Job = require('./models/Job')
const path = require('path')
const fs = require('fs')
const axios = require('axios')

const staticPath = path.join(__dirname, 'public')
const uploadPath = path.join(staticPath, 'uploads/')

async function upload(jobPath) {
    const files = fs.readdirSync(uploadPath)

    for (const file of files) {
        const img = fs.readFileSync(uploadPath + file)
        const response = await axios.post('https://content.dropboxapi.com/2/files/upload', img, {
            headers: {
                Authorization: 'Bearer nnAuQQea4hcAAAAAAAAAAbz8rFngIHdnRmUH7jjdB3wNypR-f-PuTeLmtdRqvXdS',
                'Dropbox-API-Arg': JSON.stringify({
                    path: jobPath + file,
                    mode: 'overwrite',
                    autorename: true,
                    mute: false,
                    strict_conflict: false
                }),
                'Content-Type': 'application/octet-stream'
            }
        })
        if (response.status == 200) {
            const localPath = uploadPath + file
            fs.rm(localPath, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }
}

module.exports = { upload }
