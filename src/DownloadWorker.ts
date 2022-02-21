/* eslint-disable require-jsdoc */
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import EventEmitter from 'events';

// axios.defaults.proxy = {
//   host: '127.0.0.1',
//   port: 8888,
// };

class DownloadWorker {
  private queue: Array<DownloadRequest> = [];
  private total = 0;
  private executingQueue: Array<DownloadRequest> = [];
  private thread = 4;
  private maxErrors = 50;
  private errors = 0;
  private executed = 0;
  private state = DownloadState.Stopped;

  private eventEmitter = new EventEmitter();

  constructor() {
    this.eventEmitter.on('finished', () => {
      this.queue = [];
    }).on('stop', () => {
      this.state = DownloadState.Stopped;
      this.total = 0;
      this.executingQueue = [];
      this.errors = 0;
      this.executed = 0;
    }).on('start', () => {
      this.state = DownloadState.Working;
      this.total = this.getQueueLength();
      let i = 0;
      while (i < this.thread) {
        const request = this.queue.pop();
        if (request === undefined) break;
        this.executingQueue.push(request);
        i++;
      }
      for (let x = 0; x < this.executingQueue.length; x++) {
        this.eventEmitter.emit('addExecuting', x);
      }
    }).on('addExecuting', (x) => {
      if (this.state !== DownloadState.Working) return;
      axios(this.executingQueue[x].request).then((value) => {
        this.executingQueue[x].callback.call(this, value);
        this.executed++;
        if (this.executed === this.getTotal()) {
          this.state = DownloadState.Finished;
          this.eventEmitter.emit('finished');
          return;
        }
        const request = this.queue.pop();
        if (request === undefined) return;
        this.executingQueue[x] = request;
        this.eventEmitter.emit('addExecuting', x);
      }).catch((reason) => {
        console.log(reason.message);
        console.log(reason);
        this.errors++;
        if (this.errors === this.maxErrors) {
          this.eventEmitter.emit('stop');
          this.state = DownloadState.Errored;
          this.eventEmitter.emit('error', new Error('max error reached'));
        }
        this.eventEmitter.emit('addExecuting', x);
      });
    });
  }

  add(request: DownloadRequest) {
    if (this.state === DownloadState.Working) throw new Error('now working');
    this.queue.push(request);
  }

  clear() {
    this.queue = [];
    this.executingQueue = [];
  }

  start() {
    this.state = DownloadState.Stopped;
    this.errors = 0;
    this.eventEmitter.emit('stop');
    this.eventEmitter.emit('start');
  }

  async wait() {
    return new Promise<void>((resolve, reject) => {
      this.eventEmitter.on('finished', () => {
        resolve();
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  setThread(thread: number) {
    this.thread = thread;
  }

  getThread() {
    return this.thread;
  }

  setMaxErrors(maxErrors: number) {
    this.maxErrors = maxErrors;
  }

  getMaxErrors() {
    return this.maxErrors;
  }

  getState() {
    return this.state;
  }

  isFinished() {
    return this.state === DownloadState.Finished;
  }

  isErrored() {
    return this.state === DownloadState.Errored;
  }

  getQueueLength() {
    return this.queue.length;
  }

  getTotal() {
    return this.total;
  }

  getExecuted() {
    return this.executed;
  }

  onOneFinished(callback: VoidFunction) {
    this.eventEmitter.on('addExecuting', callback);
    return this;
  }

  onError(callback: VoidFunction) {
    this.eventEmitter.on('error', callback);
    return this;
  }
}

export enum DownloadState {
  // eslint-disable-next-line no-unused-vars
  Working,
  // eslint-disable-next-line no-unused-vars
  Stopped,
  // eslint-disable-next-line no-unused-vars
  Errored,
  // eslint-disable-next-line no-unused-vars
  Finished
}

export interface DownloadRequest {
  request: AxiosRequestConfig,
  callback: RequestCallbackFunc
}

interface RequestCallbackFunc {
  (value: AxiosResponse<any>): void;
}

export default DownloadWorker;
