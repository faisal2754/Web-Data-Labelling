// const fs = require('fs')
// const Job = require('./models/Job')

// function reqBuilder(path) {
//     const req = https.request(
//         'https://content.dropboxapi.com/2/files/upload',
//         {
//             method: 'POST',
//             headers: {
//                 Authorization: 'Bearer nnAuQQea4hcAAAAAAAAAAbz8rFngIHdnRmUH7jjdB3wNypR-f-PuTeLmtdRqvXdS',
//                 'Dropbox-API-Arg': JSON.stringify({
//                     path: path,
//                     mode: 'overwrite',
//                     autorename: true,
//                     mute: false,
//                     strict_conflict: false
//                 }),
//                 'Content-Type': 'application/octet-stream'
//             }
//         },
//         (res) => {
//             if (res.statusCode == 200) {
//                 const lastIdx = path.lastIndexOf('/')
//                 const fileName = path.substring(lastIdx + 1)
//                 const localPath = 'uploads/' + fileName
//                 console.log(localPath)
//                 fs.rm(localPath, (err) => {
//                     if (err) {
//                         console.log(err)
//                     }
//                 })
//             } else {
//                 console.log(res.statusCode)
//             }
//         }
//     )

//     return req
// }

//dropbox api upload
//const upload = function (jobPath) {}

// function upload(jobPath) {
//     fs.readdir('uploads', async (err, files) => {
//         // files.forEach(async (file) => {
//         //     fs.readFile('uploads/' + file, (err, data) => {
//         //         const path = jobPath + file
//         //         const req = reqBuilder(path)
//         //         req.write(data)
//         //         req.end()
//         //     })
//         //     await sleep(2000)
//         // })
//         for (const file of files) {
//             console.log('an iteration')
//             fs.readFile('uploads/' + file, (err, data) => {
//                 const path = jobPath + file
//                 const req = reqBuilder(path)
//                 //req.write(data)
//                 req.end(data, () => {
//                     console.log(path + ' finished')
//                 })
//             })
//             sleep.sleep(2)
//             // const path = jobPath + file
//             // const req = reqBuilder(path)
//             // req.write(contents)
//             // req.end()
//         }
//     })
// }

//module.exports = { upload }
