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

    upload() {
        var fileMetadata = {
            name: 'red.jpg'
        }
        var media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream('red.jpg')
        }
        this.drive.files.create(
            {
                resource: fileMetadata,
                media: media,
                fields: 'id'
            },
            function (err, res) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('File Id: ', res.data.id)
                }
            }
        )
    }

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
