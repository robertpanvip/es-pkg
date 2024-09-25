export function isValidHttp(url: string): boolean {
    const pattern = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/i; // 匹配以http或https开头的连接
    return pattern.test(url);
}