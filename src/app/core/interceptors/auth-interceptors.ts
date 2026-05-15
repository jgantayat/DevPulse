import { HttpInterceptorFn } from "@angular/common/http";

function getToken(): string{
    return localStorage.getItem( 'auth_token' ) ?? 'fake_jwt_token_for_demo';
}


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const isInternalApi = req.url.includes('localhost:3000');

    if(!isInternalApi){
        return next(req);
    }

    const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${getToken()}`)
    });

    return next(authReq);
}