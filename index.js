const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()

//Mongo db Driver
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient

app.set('view engine', 'ejs');
//Multer file Uploader
const multer = require('multer')
const nStorage = multer.diskStorage({
    destination: __dirname+'/static/uploads/',
    filename: (req, file, callback)=>{
        const name = `${Date.now()}-upload${path.extname(file.originalname)}`
        callback(null,name);
        return name
    }
})
const upload = multer({storage: nStorage,
onFileUploadStart: (file)=>{
    console.log('Uploading '+file.originalname)
}})

// Constants
const DB_URI = 'mongodb://127.0.0.1:27017'
const DB_NAME = 'productiondb' 


mongoClient.connect(DB_URI, {useUnifiedTopology:true})
.then(client =>{
    const db = client.db(DB_NAME); 

    const auctionsCollection = db.collection('auctions')
    const instaCollection = db.collection('instagram')
    // Static files
    app.use(express.static('static'))
    app.use(bodyParser.urlencoded({extended: true}))

    // Routes
    app.get('/',(req,res)=>{
        res.sendFile(__dirname+"/templates/index.html")
    })

    app.post('/', (req, res)=>{
        res.sendFile(__dirname+'/templates/index.html')
        auctionsCollection.insertOne(req.body)
            .then(result=>{
                console.log(result)
            })
            .catch(err=>{
                console.error(error)
            })
        console.log(req.body)
    });




    app.get('/tinder',(req,res)=>{
        res.sendFile(__dirname+'/templates/tinder-home.html')
    })
    app.get('/tinder/matchfound',(request, response)=>{
        console.log(request.query.date)
        response.render('match-found',{match:request.query.date})
    })
    app.get('/tinder/findmatch',(req,res)=>{
        res.sendFile(__dirname+'/templates/find-match.html')
    })

    app.get('/instagram/', (req,res)=>{
        instaCollection.find().toArray()
        .then(results=>{
            res.render('instagram',{pics:results})
        })
        .catch(err=>{
            
        })
    })
    app.get('/instagram/upload', (req,res)=>{
        res.sendFile(__dirname+'/templates/upload.html')
    })
   
    app.post('/instagram/upload',upload.single('photo'), (req,res)=>{
        if(req.file != undefined){
            const host = req.hostname
            const fileName = req.file.filename
            const filePath = 'uploads/' + fileName
            if(req.body != null && req.body != undefined ){
                if(req.body.name != undefined){
                    const name = req.body.name
                    console.log(name+' posted '+filePath);
                    const description = req.body.description
                    instaCollection.insertOne({
                        name: name, photo: filePath,description:description
                    }).then(result=>{
                        console.log(result)
                    }).catch(err=>{
                        console.log(err)
                    })

                }
            }
        }

       res.redirect('/instagram')
        
    })



    app.get('/spotify',(req,res)=>{
        res.sendFile(__dirname+'/templates/musicplayer.html')
    })
    
    app.get('/uber', (req, res)=>{
        res.sendFile(__dirname+'/templates/uber.html')
    })
    app.listen(8080, ()=>{
        console.log('listening on 8080')
    })
}).catch(err=>console.log(err))
