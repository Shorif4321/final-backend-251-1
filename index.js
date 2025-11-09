const express = require("express");
const fileUpload = require("express-fileupload");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();



const port = process.env.PORT || 5000;

// middlewares  
app.use(cors())
app.use(express.json());
app.use(fileUpload());





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
        const servicesCollection = database.collection("Services");
        const usersCollection = database.collection("Users")
        const bookingsCollection = database.collection("Bookings")
        const specialistCollection = database.collection("Specialist")

        // bookings
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                const message = `You already booked on: ${booking.appointmentDate}😥, Try another Day`;
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        // specific bookings by email 
        app.get('/mybookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result)

        })


        // services collection
        app.get('/services', async (req, res) => {
            const date = req.query.date;

            const query = {};
            const services = await servicesCollection.find(query).toArray();

            const bookingQuery = { appointmentDate: date };
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            services.forEach((service) => {
                const optionBooked = alreadyBooked.filter((book) => book.treatment === service.name);
                const bookedSlots = optionBooked.map((book) => book.slot);
                const remainingSlots = service.slots.filter((slot) => !bookedSlots.includes(slot));
                service.slots = remainingSlots
            })
            res.send(services)
        })

        app.get('/specialties', async (req, res) => {
            const query = {};
            const result = await servicesCollection.find(query).project({ name: 1, _id: 0 }).toArray();
            res.send(result)
        })

        app.get('/specialties', async (req, res) => {
            const query = {};
            const result = await servicesCollection.find(query).project({ name: 1, _id: 0 }).toArray();
            res.send(result)
        })

        //  specialist
        app.get('/all-specialists', async (req, res) => {
            const query = {};
            const specialists = await specialistCollection.find(query).toArray();
            res.send(specialists)
        })

        app.post('/add-specialist', async (req, res) => {
            const name = req.body.name;
            const specialist = req.body.specialist;
            const email = req.body.email;
            const phone = req.body.phone;
            const image = req.files.image;
            const picData = image.data;
            const encodePic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodePic, 'base64');
            const specialPerson = {
                name,
                specialist,
                email,
                phone,
                img: imageBuffer
            }

            const result = await specialistCollection.insertOne(specialPerson);
            res.send(result)
        })




        // users start ======
        app.get('/users', async (req, res) => {
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
        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, option)
            res.send(result)
        })
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })


        // admin get/checking
        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })

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
