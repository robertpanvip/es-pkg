import {connect} from 'http2';
import http from 'http';
import {Deferred} from "./deferred";

interface FetchOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal,
    method?: string,
    body?: string | Buffer; // 请求体
}

interface FetchResponse {
    status: number;
    headers: Record<string, string>;
    data: string;
    url: string,

    json(): Promise<object>

    text(): Promise<string>
}

class ClientHttpSession {
    deferred: Deferred<http.ClientRequest>
    private readonly url: string;

    constructor(url: string) {
        this.url = url;
        this.deferred = new Deferred<http.ClientRequest>()
    }

    request(args: object) {
        const {
            path,
            method,
            ...rest
        } = Object.fromEntries(Object.entries(args).map(([key, value]) => [key.replace(':', ''), value]))
        const {hostname} = new URL(this.url);
        const deferred = new Deferred<http.IncomingMessage>()
        const request = http.request({
            hostname,
            path,
            method,
            headers: {...rest},
        },(res)=>{
            deferred.resolve(res)
        })
        const on = request.on;
        request.on = function (type, listener) {
            if (type === 'response') {
                on.call(this, type, (headers) => {
                    deferred.promise.then(res=>{
                        const _headers = {
                            ...res.headers,
                            [":status"]: headers.status || headers.statusCode,
                        }
                        return (listener as (headers: object) => void)(_headers)
                    })
                })
                return this
            }
            on.call(this, type, listener)
            return  this;
        }
        this.deferred.resolve(request)
        return request;
    }

    on(type: string, listener: (headers: object) => void) {
        this.deferred.promise.then(request => {
            request.on(type, listener)
        })
    }

    close() {
        this.deferred.promise.then(request => {
            request.destroy()
        })
    }
}

export async function fetch(url: string, options: FetchOptions = {}): Promise<FetchResponse> {
    return new Promise((resolve, reject) => {
        const {signal, body, method = 'GET'} = options; // 默认最大重定向次数为 5
        const {protocol, hostname, pathname} = new URL(url);
        let jsonDeferred = new Deferred<string>();
        let textDeferred = new Deferred<string>()
        const _resolve = (value: string) => {
            jsonDeferred.resolve(value);
            textDeferred.resolve(value)
        }
        const _reject = (error: Error) => {
            jsonDeferred.reject(error)
            textDeferred.reject(error)
        }
        // 检查中止信号
        const throwIfAborted = () => {
            // 检查 AbortSignal 是否已经发出中止信号
            if (signal && signal.aborted) {
                client.close();
                const error = new Error('Fetch aborted')
                reject(error);
            }
        }

        throwIfAborted()

        if (!['http:', 'https:'].includes(protocol)) {
            throw new Error('Only HTTP and HTTPS are supported');
        }
        const isHttp2 = protocol === 'https:'; // 使用 HTTP/2 仅支持 HTTPS


        const client = isHttp2 ? connect(url) : new ClientHttpSession(url);

        client.on('error', reject);

        const req = client.request({
            ':path': pathname,
            ':method': method, // 设置请求方法
            ...options.headers,
        });
        // 如果有请求体，写入请求
        if (body) {
            req.write(body);
        }

        let data = '';

        req.on('response', (headers) => {
            const status = headers[':status'] as number;
            let _url = url
            if (status >= 300 && status < 400) {
                // 获取重定向的 URL
                const location = headers['location'] as string;
                _url = new URL(location, _url).href; // 解析绝对 U
            }
            resolve({
                status: headers[':status'] as number,
                headers: headers as Record<string, string>,
                data: data,
                url: _url,
                async json() {
                    const data = await jsonDeferred.promise
                    return JSON.parse(data)
                },
                text: () => textDeferred.promise
            });
            req.on('data', (chunk) => {
                throwIfAborted()
                data += chunk;
            });
            req.on('end', () => {
                // 检查中止信号
                throwIfAborted();
                client.close();
                _resolve(data)
            });

        });

        req.on('error', (err) => {
            client.close();
            _reject(err)
            reject(err);
        });

        req.end();
    });
}
