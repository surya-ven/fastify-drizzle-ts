const NO_ERROR_CODE = "no_error_code";

export type Result<T, E> =
    | { readonly ok: true; data: T }
    | {
          readonly ok: false;
          err: E;
      };

type Err = {
    code: string;
    msg: string;
    show: boolean;
};
export type RetErr = Err;
type ArgErr = {
    code?: string;
    msg: string;
    show?: boolean;
};

export function Ok<T>(data?: T) {
    return { ok: true, data } as Result<T, any>;
}

export function Err(_err: ArgErr) {
    let err = _err;
    if (!err?.code) {
        err = { ...err, code: NO_ERROR_CODE };
    }
    if (!err?.show) {
        err = { ...err, show: false };
    }
    return { ok: false, err } as Result<any, Err>;
}

export type Ret<T> = Result<T, RetErr>;