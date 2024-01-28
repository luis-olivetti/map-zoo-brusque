import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Adiciona os cabeçalhos CORS à solicitação
        request = request.clone({
            setHeaders: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Ou a origem específica que você deseja permitir
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
            },
        });

        return next.handle(request);
    }
}
