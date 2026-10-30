import { Catch, Logger, type RpcExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { UNKNOWN } from "@sorokchat-messenger/contracts";
import { GrpcStatus } from "@sorokchat-messenger/microservices";
import { Observable, throwError } from "rxjs";

@Catch()
export class GrpcPassthroughFilter implements RpcExceptionFilter {
    private readonly logger = new Logger(GrpcPassthroughFilter.name);

    public catch(exception: unknown): Observable<unknown> {
        const { code, message } = this.extractCodeAndMessage(exception);
        this.logger.debug(`Passthrough extracted code: ${code}`);
        this.logger.debug(`Passthrough extracted message: ${message}`);
        return throwError(
            () =>
                new RpcException({
                    code,
                    details: message,
                }),
        );
    }

    private extractCodeAndMessage(err: unknown): { code: number; message: string } {
        if (typeof err !== "object" || err === null) {
            return { code: GrpcStatus.UNKNOWN, message: UNKNOWN };
        }
        let target: Record<string, any> = err as Record<string, any>;
        if (typeof target.getError === "function") {
            const res = target.getError();
            if (typeof res === "object" && res !== null) {
                target = res as Record<string, any>;
            } else if (typeof res === "string") {
                return { code: GrpcStatus.UNKNOWN, message: res };
            }
        }
        if (target.error && typeof target.error === "object") {
            target = target.error;
        } else if (target.response && typeof target.response === "object") {
            target = target.response;
        }
        let rawCode = target.code ?? target.status;
        let rawMessage = target.details ?? target.message;
        const detailsStr = typeof rawMessage === "string" ? rawMessage : "";
        if ((rawCode === 2 || rawCode === "2" || rawCode === undefined) && detailsStr) {
            const match = detailsStr.match(/^(\d+)\s+(?:[A-Z_]+:\s*)?(.+)$/);
            if (match) {
                rawCode = Number(match[1]);
                rawMessage = match[2];
            }
        }
        let code = Number(rawCode);
        if (isNaN(code) || code < 0 || code > 16) {
            code = GrpcStatus.UNKNOWN;
        }
        const message = typeof rawMessage === "string" && rawMessage !== "Rpc Exception"
            ? rawMessage
            : UNKNOWN;
        return { code, message };
    }
}