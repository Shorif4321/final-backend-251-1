const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const cors = require('cors')

const port = process.env.PORT || 5000;

// middlewares  
app.use(cors())
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ftktcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("Booking-System");
        const usersCollection = database.collection("Users")

        // users start ======
        app.get('/users',async(req,res)=>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })
        app.post('/users', async (req, res) => {
            const user = await req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })
        // make admin / update 
        app.patch("/users/admin/:id",async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const option = {upsert:true};
            const updatedDoc = {
                $set:{
                    role:'admin'
                }
            }
           const result = await usersCollection.updateOne(query,updatedDoc,option)
            res.send(result)
        })
        app.delete("/users/:id",async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Home Route is working');
})

app.listen(port, () => {
    console.log(`booking listening on port ${port}`)
})
