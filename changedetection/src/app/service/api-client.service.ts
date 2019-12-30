import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiClientService {
    constructor(private http: HttpClient) {
        this.timer = 5000;
    }
    public contentChanged: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private pollingTimer: any;
    private timer: number;
    public changed = false;
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
        this.http.get('/poll', { responseType: 'text'}
        ).subscribe((data) => {
            console.log(data);

            if (data === 'true') {
                this.contentChanged.next (true);
            }
        });
    }

    private getData(): void {
        this.http.get('/data').subscribe(req => {
            console.log(req);
        });
    }

    private stop(): void {
        clearInterval(this.pollingTimer);
    }
}
