export const constants = {
    serverFixturesHook: `__server_fixtures_hook__`,
};
export interface ServerFixturesOptions {
    fixtureFileName: string;
    exportName?: string;
}
export interface ServerFixtureHookMessage<T = string> {
    type: `success` | `error`;
    msg: string;
    value: T;
}
