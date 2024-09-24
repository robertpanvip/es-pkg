export class Deferred<T> {
    resolve: (value: T) => void;
    reject: (err: Error) => void;
    promise: Promise<T>;

    constructor() {
        let _resolve: (value: T) => void;
        let _reject: (err: Error) => void;
        this.promise = new Promise<T>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject
        })
        this.reject = _reject!;
        this.resolve = _resolve!;
    }

}