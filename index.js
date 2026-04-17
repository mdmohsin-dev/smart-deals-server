const express = require("express")
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config()

const port = process.env.PORT || 3000;

const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.b7lw2.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get("/", (req, res) => {
    res.send("smart deals server is running")
})


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db("smart-deals")

        const productsCollection = db.collection("products")
        const bidsCollection = db.collection("bids")
        const usersCollection = db.collection("users")



        // Product API
        app.get("/products", async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email
            }

            const products = productsCollection.find(query)

            const result = await products.toArray()
            res.send(result)
        })


        app.get("/products/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.send(result)
        })


        app.get("/latest-products", async (req, res) => {
            const latestProducts = productsCollection.find().sort({ created_at: -1 }).limit(6)
            const result = await latestProducts.toArray()
            res.send(result)
        })


        app.post("/products", async (req, res) => {
            const newProduct = req.body
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })


        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })


        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id
            const updateBody = req.body
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    name: updateBody.name,
                    price: updateBody.price
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc)
            res.send(result)
        })





        // Bids API
        app.get("/bids", async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.buyer_email = email
            }

            const bids = bidsCollection.find(query)
            const result = await bids.toArray()
            res.send(result)
        })

        app.get("/bids/byProduct/:id", async (req, res) => {
            const productId = req.params.id
            const query = { product: productId }
            const products = bidsCollection.find(query).sort({ bid_price: 1 })
            const result = await products.toArray()
            res.send(result)
        })

        app.post("/bids", async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid)
            res.send(result)
        })

        app.delete("/bids/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bidsCollection.deleteOne(query)
            res.send(result)
        })





        // Users API
        app.post("/users", async (req, res) => {
            const newUser = req.body;

            const email = req.body.email
            const query = { email: email }
            const existUser = await usersCollection.findOne(query)

            if (existUser) {
                return res.send("This user already exist")
            }

            const result = await usersCollection.insertOne(newUser)
            res.send(result)

        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`smart deals server is running on port : ${port}`)
})