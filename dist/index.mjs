import"dotenv/config";import r from"express";import o from"https";var s=r(),t=o.createServer(s),e=process.env.PORT??3e3;t.listen(e,()=>{console.log(`Server is listening on port ${e}`)});
