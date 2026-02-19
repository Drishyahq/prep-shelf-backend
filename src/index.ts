import express from 'express';


const app: express.Express = express();
const port: number = 3000;

app.get('/' , (_, res: express.Response) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(port, (error?: Error) => {
  if (error) {
    console.error('Error starting server:', error);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});