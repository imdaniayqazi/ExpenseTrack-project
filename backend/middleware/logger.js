// logger.js — har incoming request ko console mein print karta hai
function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next(); // agle middleware/route ko control pass karo
}

module.exports = logger;
