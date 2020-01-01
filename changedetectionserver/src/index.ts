import puppeteer from "puppeteer";
import express from "express";
import * as path from "path";

export class PuppeteerServer {
    private checkInterval!: NodeJS.Timeout;
    private puppeteer : any;
    private currentContent: string;
   
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
    public newContent: string;
    public oldContent: string;

    public start(): void {   
        this.initialize();
        this.stop();
        this.checkInterval = setInterval(() => 
        {
            this.executeTimer();
        }, 10000);
    }
    
    private initialize() {
        this.currentContent = '';
        this.newContent = '';
        this.firstTime = false;
        this.changed = false;
        this.message = '';
        this.connected = false;
        this.oldContent = '';
    }

    public executeTimer(): void {
        (async () => {     
            this.message = ''; 
            this.changed = false;     
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            console.log(`Trying to connect to ${this.url}`);

            if (this.url === null || this.url === undefined || this.url === '') {
                console.warn(`error while opening the url ${this.url}`);
                this.message = `Wrong input! Couldnt connect to the url "${this.url}".`;
                await browser.close();
                this.stop();
                return;
            }

            await page.goto(this.url).catch(async () => {
                console.warn(`error while opening the url ${this.url}`);
                this.message = `Couldnt open the url ${this.url}, maybe you should add "https" to the beginning.`;
                await browser.close();
                this.stop();
                return;
            });

            console.log(`connected with the url ${this.url}`);

            if (this.targetQuery === null || this.targetQuery === undefined || this.targetQuery === '') {
                console.warn(`error while getting the target query ${this.targetQuery}.`);
                this.message = `Wrong input! Couldnt open the target query "${this.targetQuery}".`;
                await browser.close();
                this.stop();
                return;
            }

            this.newContent = await page.$eval(this.targetQuery, e => e.innerHTML).catch(async () => {
                console.warn(`error while getting the target query ${this.targetQuery}.`);
                this.message = `Couldnt open the target query ${this.targetQuery}.`;
                await browser.close();
                this.stop();
                return;
            }) as string;          

            // to make a screenshot only of the target query
            const handles = await page.$(this.targetQuery);
            const buffer = await handles!.screenshot();

            if (this.newContent != this.currentContent){
                
                var fs = require('fs');

                if (this.firstTime) {
                    // rename file after the first time, because the old content is now the new content picture from the last time.
                    fs.rename('../changedetection/dist/changedetection/newContent.png', '../changedetection/dist/changedetection/oldContent.png', 
                        function (err:any) {
                            if (err) console.warn('Couldnt find the file of the image.');
                        });
                }

                await page.screenshot({path: '../changedetection/dist/changedetection/newContent.png'});
                this.oldContent = this.currentContent;
                this.currentContent = this.newContent;
                this.changed = true;
            }
            else
            {
                this.changed = false;
                await page.screenshot({path: '../changedetection/dist/changedetection/oldContent.png'});
                this.oldContent = this.currentContent;
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

export class Server {
    private app: express.Express;
    private currentContent: string;
    private puppeteerServer: PuppeteerServer;

    constructor() {
        this.puppeteerServer = new PuppeteerServer('', '');
        this.currentContent = '';
        this.app = express();
        this.app.use(express.static(path.join(__dirname, '../../changedetection/dist/changedetection')));
        this.app.use(express.json());

        this.app.get('/poll', (req, res) => {
            const responseBody = {
                changed: this.puppeteerServer.changed,
                alertMessage: this.puppeteerServer.message,
                newContent: this.puppeteerServer.newContent,
                oldContent: this.puppeteerServer.oldContent
            }

            let responseBodyTemp = JSON.stringify(responseBody);
            res.send(responseBodyTemp);
        });

        this.app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../../changedetection/dist/changedetection", "index.html"));
        });

        this.app.post("/addConfiguration", (req, res) => {
            this.puppeteerServer.url = req.body.url;
            this.puppeteerServer.targetQuery = req.body.target;
            this.puppeteerServer.start();
        });

        this.app.listen(3000, () => console.log('started at http://localhost:3000/'));
    }
}

let server:Server = new Server();