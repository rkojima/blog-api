const express = require('express');
const morgan = require('morgan');
const blogRouter = require('./blogRouter');

const app = express();

app.use(morgan('dev'));

app.use('/blog-posts', blogRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});