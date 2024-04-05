import restify from 'restify';
const server = restify.createServer();
server.use(restify.plugins.queryParser());

// import OpenAI from "openai";
// const openai = new OpenAI();

server.use(
  function crossOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

server.get('/', (req, res, next) => {
  if (!req.query.m) {
    res.end();
    next(false);
  }
  (async () => {
    try {
      // if (!req.query.m) return;
      // const message = JSON.parse(req.query.m);

      // const response = await openai.chat.completions.create({
      //   messages: message,
      //   model: 'gpt-4-turbo-preview',
      // });

      // const resp = response.choices[0];
      // const text = resp.message.content;

      // console.log(text);
      // res.send(text);
      // next();
    } catch (error) {
      // console.log(error);
      // res.send('');
      // next(false);
    }
  })();
});

var port = process.env.PORT || 8081;
server.listen(port, function() {
  console.log('Server listening on port ' + port);
});












