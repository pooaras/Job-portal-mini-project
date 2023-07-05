var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const multer = require('multer');
const ejs = require('ejs');
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')

const { kStringMaxLength } = require('buffer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const nodemailer = require('nodemailer');
const { platform } = require('os');
const { exec } = require('child_process');

const WINDOWS_PLATFORM = 'win32';
const MAC_PLATFORM = 'darwin';
const osPlatform = platform();

app.use(bodyParser.json())
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(methodOverride('_method'))


app.use('/articles', articleRouter)

mongoose.connect('mongodb://pooaraz:pooaraz@ac-kwwvw22-shard-00-00.zexi326.mongodb.net:27017,ac-kwwvw22-shard-00-01.zexi326.mongodb.net:27017,ac-kwwvw22-shard-00-02.zexi326.mongodb.net:27017/?ssl=true&replicaSet=atlas-13pimv-shard-0&authSource=admin&retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
const user= db.collection('users');
const jobs= db.collection('jobs');
db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))


app.post("/signup",(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    //console.log(req.body.employe);
    var role =req.body.employe;
    var data = {
        "name": name,
        "email" : email,
        "password" : password,
        "role" : role
    }

    db.collection('users').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
       
    });
    return res.redirect('Register/login.html')

})
var jobvalue={
    jobname: String,
    description: String,
    skills : String,
    companyname : String,
    address:String,
    email :String,
    state :String,
    country: String
}
const jobvalues=mongoose.model('jobschema',jobvalue)
app.post("/login",(req,res) => {
    var email=req.body.email;
    var password=req.body.password;
    user.findOne({ email:email}).then((data) => {
       
        if(data.password==password && data.role=="employee"){
        //res.send({ status: "ok", data: data });
        jobs.find({}).toArray( function(err,jobv){
            
            //console.log(jobv);
            res.render('index',{
                jobv:jobv,
                name: data.name
            })
        })
        // res.render('index',{
        //     name: data.name
        // })
    }
        else if(data.password==password && data.role=="employer")
        {   
            res.render('employer',{
                name: data.name
            })
        }
        else
        res.send("incorect pswd");

        app.post('/postjob',(req,res) => {
            var jobname=req.body.jobname;
            var description=req.body.description;
            var skills=req.body.skills;
            var companyname=req.body.companyname;
            var email=req.body.email;
            var address=req.body.address;
            var state =req.body.state;
            var country=req.body.country;
            var vacancy=req.body.vacancy;
            var salary =req.body.salary;
            var experience=req.body.experience;
            var posteddate=new Date().toLocaleDateString("de-DE");
            var jobdata={
                "jobname": jobname,
                "description": description,
                "skills" : skills,
                "companyname" : companyname,
                "address":address,
                "email" :email,
                "state" :state,
                "country": country,
                "salary":salary,
                "vacancy":vacancy,
                "experience":experience,
                "posteddate":posteddate
            }

            db.collection('jobs').insertOne(jobdata,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("jobs Inserted Successfully");
               
            });

        })
        app.get('/loggedin',(req,res) => {
        
            jobs.find({}).toArray( function(err,jobv){
            
                // console.log(jobv);
                res.render('index',{
                    jobv:jobv,
                    name: data.name
                })
            })
        })
        app.get('/apply', (req,res) => {
            res.render('apply',{
               name:data.name 
            })
            app.post("/application",upload.single('resume'),(req,res) => {

                var resume=req.body.file;
                var nameap = req.body.firstname+" "+req.body.lastname;
                var email=req.body.email;
                var address=req.body.address;
                var message=req.body.message;
                
                
                sendmail();
                function sendmail(){
                
                    //document.getElementsById("app").innerHTML="hi";
                    return new Promise ((resolve,reject)=> {
                    let mailTransporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'pooarashh@gmail.com',
                            pass: 'zlkcqpuifjbqqewn'
                        }
                    });
                    
                    let mailDetails = {
                        from: email,
                        to: 'pooarasusivaraj2002@gmail.com',
                        subject: 'Application for the job',
                        text: "I'm "+nameap+ "from"+address+". "+message,
                        attachments: [
                            {
                              filename: "Resume.pdf",
                              path: resume
                            }
                          ]
                        
                    };
                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('Email sent successfully');
                        }
                    });
                
                    
                }
                    )}
                });

        })
        app.get('/jobdetail',(req,res) => {
            res.render('job_details',{
            name: data.name

            });
        })
        app.get('/joblist',(req,res) => {
        
            res.render('job_listing',{
               name: data.name
            });
        })
        app.get('/blog', async (req, res) => {
            const articles = await Article.find().sort({ createdAt: 'desc' })
            res.render('articles/index', { articles: articles })
          })
        
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
      
})

  

app.get("/",(req,res)=>{
 
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    res.sendFile("./index.html");
}).listen(3000);


console.log("Hello, I'm Pooarasu. My mini project is a website, so I ask you to install Node.js version 12 or higher, open the browser, and type 'localhost:3000' and enter.");
let command;
var url="http://localhost:3000";
if (osPlatform === WINDOWS_PLATFORM) {
  command = `start microsoft-edge:${url}`;
} else if (osPlatform === MAC_PLATFORM) {
  command = `open -a "Google Chrome" ${url}`;
} else {
  command = `google-chrome --no-sandbox ${url}`;
}

console.log(`executing command: ${command}`);

exec(command);