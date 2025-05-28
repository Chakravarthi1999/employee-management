declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: {
        id: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
