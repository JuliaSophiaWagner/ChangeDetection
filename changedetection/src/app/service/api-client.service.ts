import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiClientService {
    private pollingTimer: any;
    private timer: number;

    constructor(private http: HttpClient) {
        this.timer = 5000;
        this.messages = new ChangeDetectionMessage();
    }

    public contentChanged: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public changed = false;
    public messages: ChangeDetectionMessage;

    public configure(url: string, target: string): void {
        const data = {
            url,
            target
        };

        this.http.post('/addConfiguration', data).subscribe(
            (response) => console.log(response),
            (error) => console.error(error)
        );

        this.pollingTimer = setInterval(() => {
            this.polling();
        }, this.timer);
    }

    private polling(): void {
        console.log('start polling');
        this.http.get('/poll', {responseType: 'json'}).subscribe(data => {
            const jsonTemp = JSON.parse(JSON.stringify(data));
            this.messages.changed = jsonTemp.changed;
            this.messages.alertMessage = jsonTemp.alertMessage;
            this.messages.newContent = jsonTemp.newContent;
            this.messages.oldContent = jsonTemp.oldContent;

            if (this.messages.changed === true) {
                this.contentChanged.next (true);
            }
            // console.log(JSON.parse(JSON.stringify(data))[0]);
            // console.log(JSON.parse(JSON.stringify(data)[0]));
            // console.log(data[3]);
            // console.log(data)
            // this.messages = Object.assign(new ChangeDetectionMessage(), data)
            // console.log(data);
            // const test = data.split(',');
            // test.forEach(element => {
            //     // console.log(element.split(':')[0]);
            //     // console.log(element.split(':')[1]);
            //     const elementTemp = element.split(':');
            //     console.log(element);
            //     if (elementTemp[0] === '{"changed"') {
            //         if (elementTemp[1] === 'false') {
            //             this.messages.changed =  false;
            //         } else {
            //             this.messages.changed = true;
            //             this.contentChanged.next (true);
            //         }
            //     } else if (elementTemp[0] === '"alertMessage"') {
            //         this.messages.alertMessage = element.split('"')[3];
            //     } else if (elementTemp[0] === '"newContent"') {
            //         this.messages.newContent = element.split('"')[3];
            //     } else if (elementTemp[0] === '"oldContent"') {
            //         this.messages.oldContent = element.split('"')[3];
            //     }
            // });
        });

        // this.http.get('/poll', { responseType: 'text'}
        // ).subscribe((data) => {
        //     console.log(data);

        //     if (data === 'true') {
        //         this.contentChanged.next (true);
        //     }
        // });
    }

    private stop(): void {
        clearInterval(this.pollingTimer);
    }
}

export class ChangeDetectionMessage {
    public changed: boolean;
    public alertMessage: string;
    public newContent: string;
    public oldContent: string;

    constructor() {
        this.changed = false;
        this.alertMessage = '';
        this.oldContent = '';
        this.newContent = '';
    }
}
