
export const titleCase = (str: string) => {
    const strArr = str.split(/[_\-]/)
    return strArr.map(item => {
        let tmp = item.toLowerCase()
        tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1)
        return tmp
    }).join("")
}

export const getValidPkgName = (str: string) => {
    const regex = /\/([\w-]+)$|^([\w-]+)$/;
    const match = str.match(regex);
    if (match) {
        return match[1] || match[2]
    }
    return str
}

export function toPascalCase(str?:string) {
    if (typeof str!== 'string' || str.length === 0) return '';
    // 先转换为小写，再处理特殊字符和大写字母
    return str
        // 将非字母数字字符替换为空格
        .replace(/[^a-zA-Z0-9]/g, ' ')
        // 处理连续大写字母（如 "HELLO" 拆分为 "Hello"）
        .replace(/([A-Z]+)/g, ' $1')
        // 分割为单词数组（过滤空字符串）
        .split(/\s+/)
        .filter(word => word)
        // 每个单词首字母大写，其余小写
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * 版本号比较大小
 * @param v1
 * @param v2
 */
export const compare: (v1: string, v2: string) => number = (v1, v2) => {
    if (v1 === v2) {
        return 0
    }
    const arr1 = v1.split(/\D/) as unknown as number[]
    const arr2 = v2.split(/\D/) as unknown as number[]

    // 默认版本号长度一样
    for (let i = 0; i < arr1.length;) {
        // 字符串相减将字符串隐式转成数字
        if (arr1[i] - arr2[i] > 0) {
            return 1
        }
        if (arr1[i] - arr2[i] < 0) {
            return -1
        }
        if (arr1[i] === arr2[i]) {
            i++
        }
    }
    return 0;
}

export const autoUpgrade = (str: string) => {
    let arr = str.split('.').map(it => Number(it));
    const autoUpgradeVersion = (arr: number[], index: number) => {
        if (index === 0) {
            arr[0] = arr[0] + 1;
        } else {
            let value = arr[index] + 1;
            if (value < 30) {
                arr[index] = value;
            } else {
                arr[index] = 0;
                autoUpgradeVersion(arr, index - 1);
            }
        }
    }
    autoUpgradeVersion(arr, arr.length - 1);
    return arr.map(it => Number(it)).join('.');
}


