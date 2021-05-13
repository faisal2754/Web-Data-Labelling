const fs = require('fs')
const { google } = require('googleapis')

const googleServices = class googleServices {
    constructor() {
        //getting credentials from credentials.json
        const bufferCreds = fs.readFileSync('credentials.json')
        if (!bufferCreds) return console.log('Error loading client secret file.')
        const credentials = JSON.parse(bufferCreds)
        const { client_secret, client_id, redirect_uris } = credentials.installed
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

        //getting token from token.json (if it exists)
        const token = fs.readFileSync('token.json')
        if (!token) return console.log('No token bruh')
        oAuth2Client.setCredentials(JSON.parse(token))

        //setting global variables
        const auth = oAuth2Client
        this.drive = google.drive({ version: 'v3', auth })
    }

    createFolder() {
        var fileMetadata = {
            name: 'Data-Labelling',
            mimeType: 'application/vnd.google-apps.folder'
        }
        this.drive.files.create(
            {
                resource: fileMetadata,
                fields: 'id'
            },
            function (err, file) {
                if (err) {
                    console.error(err)
                } else {
                    console.log('Folder Id: ', file.data.id)
                }
            }
        )
    }

    uploadSingleFile(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileMetadata = {
                    name: file,
                    parents: ['14yJctoyNoX6ivWJre9dXLLgbUVnNRvpZ']
                }
                const media = {
                    mimeType: 'image/jpeg',
                    body: fs.createReadStream(`images/${file}`)
                }
                this.drive.files.create(
                    {
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    },
                    function (err, res) {
                        if (err) {
                            err()
                            console.log(err)
                        } else {
                            //console.log('File Id: ', res.data.id)
                            console.log('Uploading file: ', file)
                        }
                    }
                )
            }, Math.random() * 1000)
        })
    }

    promiseUpload(files) {
        const promises = []
        for (let i = 0; i < files.length; i++) {
            console.log('Uploading ', files[i])
            const fileMetadata = {
                name: files[i],
                parents: ['14yJctoyNoX6ivWJre9dXLLgbUVnNRvpZ']
            }
            const media = {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(`images/${files[i]}`)
            }
            promises.push(
                this.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id, name'
                })
            )
        }
        Promise.all(promises)
            .then((results) => {
                console.log('All done', results)
            })
            .catch((e) => {
                console.log(e)
            })
        // const pr = new Promise((resolve, reject) => {
        //     console.log(this)
        //     resolve('I am done')
        // })
        // return pr
    }

    // uploadFiles(files) {
    //     const prom = new Promise((res, err) => {
    //         for (var i = 0; i < files.length; i++) {
    //             const fileMetadata = {
    //                 name: files[i],
    //                 parents: ['14yJctoyNoX6ivWJre9dXLLgbUVnNRvpZ']
    //             }
    //             const media = {
    //                 mimeType: 'image/jpeg',
    //                 body: fs.createReadStream(`images/${files[i]}`)
    //             }
    //             const name = files[i]
    //             this.drive.files.create(
    //                 {
    //                     resource: fileMetadata,
    //                     media: media,
    //                     fields: 'id'
    //                 },
    //                 function (err, res) {
    //                     if (err) {
    //                         err()
    //                         console.log(err)
    //                     } else {
    //                         //console.log('File Id: ', res.data.id)
    //                         console.log('Uploading file: ', name)
    //                     }
    //                 }
    //             )
    //         }
    //         // files.forEach((file) => {
    //         //                 })
    //         //res(1)
    //     }).then(
    //         (resp) => {
    //             res('bruh')
    //         },
    //         (resp) => {
    //             console.log(resp)
    //         }
    //     )
    //     return prom
    // }

    downloadFile(fileId) {
        const dest = fs.createWriteStream('photo.jpg')

        this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }).then((res) => {
            res.data
                .on('end', () => {
                    console.log('Done downloading file.')
                })
                .on('error', (err) => {
                    console.error('Error downloading file.')
                })
                .pipe(dest)
        })
    }
}

module.exports = googleServices
