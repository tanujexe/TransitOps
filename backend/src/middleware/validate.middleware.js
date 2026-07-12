const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign validated/sanitized inputs back to request
    req.body = validated.body;
    req.query = validated.query;
    req.params = validated.params;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
