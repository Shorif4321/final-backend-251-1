const express = require("express");
const app = express();
const cors = require('cors')

const port = process.env.PORT || 5000;

// middlewares
app.use(cors())

app.get('/',(req,res)=>{
    res.send('Home Route is working');
})
const users = [
    {
        name:'user@gmail.com',age:11
    },
    {
        name:'user2@gmail.com',age:12
    },
    {
        name:'user3@gmail.com',age:13
    },
]
app.get('/users',(req,res)=>{
    res.send(users);
})

app.listen(port,()=>{
     console.log(`booking listening on port ${port}`)
})
