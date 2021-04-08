import { serverFixturesShared } from '@zeejs/test-browser';
import type { ServerFixturesOptions, ServerFixtureHookMessage } from '@zeejs/test-browser';
const { constants } = serverFixturesShared;

export async function expectServerFixture<T = string>(options: ServerFixturesOptions): Promise<T> {
    const result: ServerFixtureHookMessage<T> = await (window as any)[constants.serverFixturesHook](
        options
    );
    if (result.type === `error`) {
        throw new Error(result.msg);
    }
    return result.value;
}
