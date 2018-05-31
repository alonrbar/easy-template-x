var ctx = (require as any).context('.', true, /\.(ts|js)$/);
ctx.keys().forEach(ctx);
module.exports = ctx;