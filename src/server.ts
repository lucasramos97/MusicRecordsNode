import AppController from 'src/controllers/AppController';

const app = new AppController().getExpress();

app.listen(process.env.PORT || 8080);
