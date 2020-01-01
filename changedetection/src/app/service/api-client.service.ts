import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ApiClientService {
    private pollingTimer: any;
    private timer: number;

    constructor(private http: HttpClient) {
        this.timer = 10000;
        this.messages = new ChangeDetectionMessage();
    }

    public contentChanged: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public changed = false;
    public messages: ChangeDetectionMessage;

    public configure(url: string, target: string): void {
        this.stop();

        const data = {
            url,
            target
        };

        this.pollingTimer = setInterval(() => {
            this.polling();
        }, this.timer);

        this.http.post('/addConfiguration', data).subscribe(
            (error) => this.stop()
        );
    }

    private polling(): void {
        this.http.get('/poll', {responseType: 'json'}).subscribe(data => {
            const jsonTemp = JSON.parse(JSON.stringify(data));
            this.messages.changed = jsonTemp.changed;
            this.messages.alertMessage = jsonTemp.alertMessage;
            this.messages.newContent = jsonTemp.newContent;
            this.messages.oldContent = jsonTemp.oldContent;
            this.contentChanged.next (true);
        });
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
