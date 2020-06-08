import { constants, ServerFixturesOptions, HookMessage } from './shared';

export async function expectServerFixture<T = string>(options: ServerFixturesOptions): Promise<T> {
    const result: HookMessage<T> = await (window as any)[constants.serverFixturesHook](options);
    if (result.type === `error`) {
        throw new Error(result.msg);
    }
    return result.value;
}
