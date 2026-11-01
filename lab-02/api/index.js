module.exports = async (req, res) => {
  try {
    const app = require('../index.js');
    return app(req, res);
  } catch (err) {
    res.status(500).json({
      error: 'Vercel Serverless Exception',
      message: err.message,
      stack: err.stack,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  }
};
