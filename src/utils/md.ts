import {ComponentDoc, PropItem} from 'react-docgen-typescript';

function escapeString(str:string) {
    return str?.replace(/\|/g, '&#124;')
}
export function renderTable({props, methods, displayName, description}: ComponentDoc) {
    const getValue = (item: PropItem) => {
        return {
            ["参数"]: item.name || ' ',
            ["说明"]: item.description || ' ',
            ["类型"]: item.type?.name || ' ',
            ["默认值"]: item.defaultValue || ' ',
            ["必须"]: item.required || ' '
        }
    }

    const columns = Object.entries(props).map(([key, value]) => getValue(value))
    if (columns.length == 0) {
        return ''
    }
    const titles = Object.keys({...columns[0] as Object})
    // 构建表格头部
    const tableHeader: string = '|' + titles.join('|') + '|';

// 构建表格分隔线
    const tableSeparator: string = '|' + Array(titles.length).fill('---').join('|') + '|';

// 构建表格内容
    let tableRows: string = '';
    for (let i = 0; i < columns.length; i++) {
        tableRows += '|' + Object.values(columns[i]).map(it => escapeString(`${it}`)).join('|') + '|\n';
    }

// 构建最终的表格文本
    return `🔨 **${displayName} API** \n \n ${escapeString(description)} \n` + tableHeader + '\n' + tableSeparator + '\n' + tableRows
}