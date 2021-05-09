if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const authRoute = require('./routes/auth')
const protectedRoute = require('./routes/protected')
const unprotectedRoute = require('./routes/unprotected')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')

const googleServices = require('./googleServices')

const service = new googleServices()
//service.downloadFile('1jxcXbkj3qL15TCbcsyA6DN9cj_uDeQb_')
//service.getFile('1jxcXbkj3qL15TCbcsyA6DN9cj_uDeQb_')

/////////////////////////////////////google drive test
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
//Drive API, v3
//https://www.googleapis.com/auth/drive	See, edit, create, and delete all of your Google Drive files
//https://www.googleapis.com/auth/drive.file View and manage Google Drive files and folders that you have opened or created with this app
//https://www.googleapis.com/auth/drive.metadata.readonly View metadata for files in your Google Drive
//https://www.googleapis.com/auth/drive.photos.readonly View the photos, videos and albums in your Google Photos
//https://www.googleapis.com/auth/drive.readonly See and download all your Google Drive files
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Google Drive API.
    //authorize(JSON.parse(content), listFiles);
    //authorize(JSON.parse(content), getFile);
    //authorize(JSON.parse(content), uploadFile)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client) //list files and upload file
        //callback(oAuth2Client, '0B79LZPgLDaqESF9HV2V3YzYySkE');//get file
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err)
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            callback(oAuth2Client)
        })
    })
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth })
    getList(drive, '')
}
function getList(drive, pageToken) {
    drive.files.list(
        {
            corpora: 'user',
            pageSize: 10,
            //q: "name='elvis233424234'",
            pageToken: pageToken ? pageToken : '',
            fields: 'nextPageToken, files(*)'
        },
        (err, res) => {
            if (err) return console.log('The API returned an error: ' + err)
            const files = res.data.files
            if (files.length) {
                console.log('Files:')
                processList(files)
                if (res.data.nextPageToken) {
                    getList(drive, res.data.nextPageToken)
                }

                // files.map((file) => {
                //     console.log(`${file.name} (${file.id})`);
                // });
            } else {
                console.log('No files found.')
            }
        }
    )
}
function processList(files) {
    console.log('Processing....')
    files.forEach((file) => {
        // console.log(file.name + '|' + file.size + '|' + file.createdTime + '|' + file.modifiedTime);
        console.log(file)
    })
}
function uploadFile(auth) {
    const drive = google.drive({ version: 'v3', auth })
    var fileMetadata = {
        name: 'red.jpg'
    }
    var media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream('red.jpg')
    }
    drive.files.create(
        {
            resource: fileMetadata,
            media: media,
            fields: 'id'
        },
        function (err, res) {
            if (err) {
                // Handle error
                console.log(err)
            } else {
                console.log('File Id: ', res.data.id)
            }
        }
    )
}
function getFile(auth, fileId) {
    const drive = google.drive({ version: 'v3', auth })
    drive.files.get({ fileId: fileId, fields: '*' }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err)
        console.log(res.data)
    })
}
////////////////////////////////////////////////////

//port and path
const staticPath = path.join(__dirname, 'public')
const port = process.env.PORT || 3000

//use ejs and static files
app.set('view engine', 'ejs')
app.use(express.static(staticPath))
app.use(express.urlencoded({ extended: false }))

//connect to mongodb
async function connectDB() {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useCreateIndex: true
            },
            () => console.log('connected to db!')
        )
    } catch (error) {
        console.log(error)
    }

    //safety starts
    mongoose.connection.on('error', (err) => {
        console.log(err)
    })
    //end of safety
}
connectDB()

//middleware
app.use(methodOverride('_method'))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
)
app.use(flash())

//initialise passport
app.use(passport.initialize())
app.use(passport.session())

//routes
app.use('', authRoute)
app.use('', protectedRoute)
app.use('', unprotectedRoute)

//server listen
app.listen(port, () => {
    console.log(`server started on port ${port}`)
})
