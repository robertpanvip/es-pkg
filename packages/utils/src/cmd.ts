import type {ExecaReturnValue, Options as ExecaOptions} from 'execa'

export async function run(
    bin: string,
    args: string[],
    opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
    //由于execa 的包是esm形式的
    const {execa} = await import("execa")
    return execa(bin, args, {stdio: 'inherit', ...opts})
}