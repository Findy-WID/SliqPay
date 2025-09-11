export const validate = (schema) => (req, _res, next) => {
    const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!parsed.success)
        return next({ status: 400, message: 'Validation failed', details: parsed.error.flatten() });
    req.body = parsed.data.body;
    next();
};
export default validate;
