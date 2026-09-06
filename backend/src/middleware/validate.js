const { error } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.validated = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const issues = err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }));
        return error(res, 'VALIDATION_ERROR', 'Input validation failed', 422, issues);
      }
      next(err);
    }
  };
}

module.exports = validate;
