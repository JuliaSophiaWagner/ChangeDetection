import puppeteer, { TargetAwaiter } from "puppeteer";
import express from "express";
import * as path from "path";
import { EventEmitter } from "events";

export class PuppeteerServer {
    private checkInterval!: NodeJS.Timeout;
    private puppeteer : any;
   
    constructor(url: string, targetQery: string) {
        this.puppeteer = require('puppeteer');
        this.currentContent = '';
        this.newContent = '';
        this.url = url;
        this.targetQuery = targetQery;
        this.firstTime = false;
        this.changed = false;
        this.message = '';
        this.connected = false;
        this.oldContent = '';
    }

    public message:string;
    public changed: boolean;
    public url: string;
    public connected: boolean;
    public targetQuery: string;
    public firstTime: boolean;
    public currentContent: string;
    public newContent: string;
    public oldContent: string;

    public start(): void {   
        console.log('Start puppeteer');
        this.stop();
        this.checkInterval = setInterval(() => 
        {
            this.executeTimer();
        }, 10000);
    }

    public executeTimer(): void {
        (async () => {
           
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            console.log(`Trying to connect to ${this.url}`);

            await page.goto(this.url).catch(async () => {
                console.warn(`error while opening the url ${this.url}`);
                this.message = `Couldnt open the url ${this.url}, maybe you should add "https" to the beginning.`;
                await browser.close();
                this.stop();
                return;
            });

            console.log('connected');
            this.newContent = await page.$eval(this.targetQuery, e => e.innerHTML).catch(async () => {
                console.warn(`error while getting the target query ${this.targetQuery}.`);
                this.message = `Couldnt open the target query ${this.targetQuery}.`;
                await browser.close();
                this.stop();
                return;
            }) as string;          

            this.message = '';

            if (this.firstTime === false)
            {
                await page.screenshot({path: '../changedetection/dist/changedetection/newContent.png'});
                await page.screenshot({path: '../changedetection/dist/changedetection/oldContent.png'});
            }

            if (this.newContent != this.currentContent){
                
                var fs = require('fs');
                this.changed = true;
                fs.rename('../changedetection/dist/changedetection/newContent.png', '../changedetection/dist/changedetection/oldContent.png', function (err:any) {
                  if (err) throw err;
                });
    
                await page.screenshot({path: '../changedetection/dist/changedetection/newContent.png'});
                this.oldContent = this.currentContent;
                this.currentContent = this.newContent as string;
            }
            else
            {
                this.changed = false;
                await page.screenshot({path: '../changedetection/dist/changedetection/oldContent.png'});
            }

            this.firstTime = true;
            await browser.close(); 
        })();
    }
    

    public stop(): void {
        this.firstTime = false;
        this.connected = false;
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
    
    const responseBody = {
        changed: puppeteerServer.changed,
        alertMessage: puppeteerServer.message,
        newContent: puppeteerServer.newContent,
        oldContent: puppeteerServer.oldContent
    }

    let responseBodyTemp = JSON.stringify(responseBody);
    res.send(responseBodyTemp);
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../../changedetection/dist/changedetection", "index.html"));
});

// start the server on port 3000
app.listen(3000, () => console.log('started at http://localhost:3000/'));

app.post("/addConfiguration", function(req, res) {
console.log("addconfiguration");
console.log(req.body.url);
url = req.body.url;
targetQuery = req.body.target;
puppeteerServer.url = url;
puppeteerServer.targetQuery = targetQuery;
puppeteerServer.start();
});