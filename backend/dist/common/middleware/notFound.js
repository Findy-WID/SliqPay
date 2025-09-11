export function notFound(_req, _res, next) {
    next({ status: 404, message: 'Not Found' });
}
