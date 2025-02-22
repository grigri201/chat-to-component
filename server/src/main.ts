import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { router } from '~/api';

const app = express();

// 中间件
app.use(cors());
app.use(json());

// 路由
app.use('/', router);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
