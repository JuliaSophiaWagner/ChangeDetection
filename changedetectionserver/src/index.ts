import puppeteer, { TargetAwaiter } from "puppeteer";
import express from "express";
import * as path from "path";
import { EventEmitter } from "events";

export class PuppeteerServer {
    private checkInterval!: NodeJS.Timeout;
    private puppeteer : any;
    constructor(url: string, targetQery: string) {
        this.puppeteer = require('puppeteer');
        this.currentContent = "";
        this.lastChangeTimestamp = 0;
        this.url = url;
        this.targetQuery = targetQery;
        this.onContentChanged = new EventEmitter();
        this.firstTime = false;
        this.changed = false;
    }

    public changed: boolean;
    public onContentChanged: EventEmitter;

    public currentContent: string;

    public lastChangeTimestamp: number;

    public url: string;

    public targetQuery: string;
    public firstTime: boolean;

    public start(): void {   
        console.log('Start puppeteer');
        this.onContentChanged.emit('data');
        this.stop();
        this.checkInterval = setInterval(() => 
        {
            this.executeTimer();
        }, 10000);
    }

    public executeTimer(): void {
        (async () => {
           
        console.log(this.url);
        console.log("check");

         const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            console.log(`Trying to connect to ${this.url}`);
            await page.goto(this.url).catch(async () => {
                console.warn("error while opening the url.");
                await browser.close();
                return;
            });
            console.log('connected');
            let newContent = await page.$eval(this.targetQuery, e => e.innerHTML);
            console.log(this.targetQuery)
          

            if (this.firstTime === false)
            {
                await page.screenshot({path: '../changedetection/dist/changedetection/newContent.png'});
                await page.screenshot({path: '../changedetection/dist/changedetection/oldContent.png'});
            }

            if (newContent != this.currentContent){
                
                var fs = require('fs');
                this.changed = true;
                fs.rename('../changedetection/dist/changedetection/newContent.png', '../changedetection/dist/changedetection/oldContent.png', function (err:any) {
                  if (err) throw err;
                  console.log('File Renamed.');
                });
    
                await page.screenshot({path: '../changedetection/dist/changedetection/newContent.png'});
                console.log("content changed");
                this.lastChangeTimestamp = Date.now();
                this.currentContent = newContent;
                this.onContentChanged.emit('data');
            }
            else
            {
                this.changed = false;
                await page.screenshot({path: '../changedetection/dist/changedetection/oldContent.png'});
            }

            this.firstTime = true;
            await browser.close(); 
        })();

        // (async () => {
        //     console.log("start");
        //     const browser = await puppeteer.launch();
        //     const page = await browser.newPage();
        //     await page.goto(this.url);
        //     console.log(page);
        //     await browser.close();
        //     this.stop();
                
        // })();
    }

    

    public stop(): void {
        this.firstTime = false;
        clearInterval(this.checkInterval);
    }
}

// export class Server {
//     public app: express.Express;
//     public serverName = "webserver";
//     public tokens: string[] = [];
//     public timer: any;
//     public currentContent: string = "";
//     public lastChangeTimestamp: any;
//     public url: string = "www.fhwn.ac.at";
    
//     public targetQuery: string = ".content-wrapper .container h2";
    
    
//     constructor() {
//         // initialize the express js app
//         this.app = express();

//         // offer the angular page
//         this.app.use(express.static(path.join(__dirname, "../../changedetection/dist/changedetection")));
        
//         this.app.get("*", function (req, res) {
//             res.sendFile(path.join(__dirname, "../../changedetection/dist/changedetection", "index.html"));
//         });
        
//         // start the server on port 3000
//         this.app.listen(3000, () => console.log('started at http://localhost:3000/'));

//         this.app.post("/setconfig", function(req, res) {
//         let url = req.body.url;
//         let target = req.body.target;
//         console.log(url);
//         console.log(target);
    
//         url = url;
//         // const targetQuery = target;
//         });
    
//         this.app.get("/latest", function(req, res) {
//             console.log('get');
//             let responseBody = {
//                 latestPollTimestamp: Date.now(),
//                 // lastChangeTimestamp: lastChangeTimestamp,
//                 // latestContent: observer.currentContent
//             }
        
//             res.send(JSON.stringify(responseBody));
//         });    
// }   
    
// public start(): void {
//         this.timer = setInterval(() => {
//             this.execute(this.url, this.targetQuery);
//         }, 5000);
//     }

//     public stop(): void {
//         clearInterval(this.timer);
//     }

//     public execute(url: string, target: string): void {
//         console.log("check");
//     }
// }

// create the server
// new Server();

let serverName = "webserver";
let tokens: string[] = [];
let timer: any;
let currentContent: string = "";
let lastChangeTimestamp: any;
let url: string = "";
let targetQuery: string = ".content-wrapper .container h2";
let puppeteerServer = new PuppeteerServer(url, targetQuery);

// initialize the express js app
const app = express();

// offer the angular page
app.use(express.static(path.join(__dirname, "../../changedetection/dist/changedetection")));
app.use(express.json());

app.get('/poll', (req, res) => {
    // let curToken = req.header('Authorization');
        let responseBody = {
            changed: puppeteerServer.changed
            // timestamp: Date.now()
        }
        // res.status(200).json(['polling message']);
        res.send(puppeteerServer.changed);
        console.log('polling');
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../../changedetection/dist/changedetection", "index.html"));
});

// start the server on port 3000
app.listen(3000, () => console.log('started at http://localhost:3000/'));
// puppeteerServer.onContentChanged.on('data', (test)=>sendData(test));


app.post("/addConfiguration", function(req, res) {
console.log("addconfiguration");
console.log(req.body.url);
url = req.body.url;
targetQuery = req.body.target;
puppeteerServer.url = url;
puppeteerServer.targetQuery = targetQuery;
puppeteerServer.start();
});


// app.get("/polling", function(req, res) {
//     // if (req.query.lastTimestamp == undefined){
//     //     res.status(400).send("No timestamp specified");
//     //     return;
//     // }
//     console.log('polling');
//     let lastTimestamp = Number(req.query.lastTimestamp);
//     let responseBody;

//     // TODO !!!
//     responseBody = {
//         success: true,
//         timestamp: Date.now()
//     }

//     // res.send(JSON.stringify(responseBody));
// });

// app.get("/poll", function(req, res) {
//     if (req.query.lastTimestamp == undefined){
//         res.status(400).send("No timestamp specified");
//         return;
//     }

//     let lastTimestamp = Number(req.query.lastTimestamp);
//     let responseBody;

//     if (puppeteerServer.lastChangeTimestamp > lastTimestamp) {
//         responseBody = {
//             success: true,
//             timestamp: Date.now()
//         }
//     }else{
//         
//     }

//     res.send(JSON.stringify(responseBody));
// });
