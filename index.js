const express = require("express")
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

const app = express()

app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://smartDeals-user:K5UA7XZKIKM7sPwm@cluster0.b7lw2.mongodb.net/?appName=Cluster0";

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


        app.get("/products", async (req, res) => {
            const products = productsCollection.find().sort({ price_min: 1 }).limit(6)
            const result = await products.toArray()
            res.send(result)
        })


        app.get("/products/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
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