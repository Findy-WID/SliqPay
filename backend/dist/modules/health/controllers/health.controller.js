export function health(_req, res) {
    res.json({ status: 'ok', ts: new Date().toISOString() });
}
