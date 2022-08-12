import {
    root,
    text,
    strong,
    tableCell,
    tableRow,
    table,
} from 'mdast-builder';
import remarkStringify from 'remark-stringify';
import unified from 'unified';

const processor = unified().use(remarkStringify as any, {
    bullet: '*',
    fence: '`',
    fences: true,
    incrementListMarker: false
},);

export function renderTable({props}: any) {
    const getValue = (item: any) => {
        return {
            ["name"]: item.name,
            ["type"]: item.type?.name,
            ["description"]: item.description,
            ["defaultValue"]: item.defaultValue,
            ["required"]: item.required
        }
    }
    const columns = Object.entries(props).map(([key, value]) => getValue(value))
    const titles = Object.keys({...columns[0] as Object})
    const ast = root([
        strong(text("🔨 API")),
        table(
            columns.map(() => 'left'),
            [
                tableRow(titles.map(item => tableCell(text(`${item}`)))),
                ...columns.map((item: Object) => {
                    const values = Object.values(item)
                    return tableRow(values.map((item) => {
                            if (item == undefined) {
                                item = ""
                            }
                            let txt = typeof item === 'object' ? JSON.stringify(item) : item;

                            return tableCell(text(`${txt}`))
                        }
                    ));
                })
            ],
        )
    ])
    return processor.stringify(ast as any);
}