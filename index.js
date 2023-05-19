const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()

const port =  process.env.PORT || 5000 ;

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.arwkaoj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollections = client.db('toyMarket').collection('toys')

    const indexKeys = {name:1 , salername:1}
    const indexOptions = {name: "serchName"}

    const result = await toyCollections.createIndex(indexKeys,indexOptions)

    app.get('/serchByName/:text',async(req,res)=>{
      const searchText = req.params.text;

      const result = await toyCollections.find(
        {
          $or:[
            {name: {$regex: searchText, $options: "i"} },
            {salername: {$regex: searchText, $options: "i"}},
          ],
        }
      ).toArray()
      res.send(result)
    })

  

    //Post Add toy to Fetch here-------
    app.post('/postToy', async(req,res) => {
        const body = req.body;
        const result = await toyCollections.insertOne(body)
        res.send(result)
        console.log(result)
    })

    app.get('/allToy' , async(req,res)=>{
        const result = await toyCollections.find({}).toArray()
        res.send(result)
    })

    app.get('/myToy/:email', async(req,res)=>{
      console.log(req.params.email)
      const result = await toyCollections.find({postedBy:req.params.email}).toArray()
      res.send(result);
    })


    app.put("updateToyInfo/:id", async(req,res)=>{
      const id = req.params.id;
      const body = req.body;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          name:body.name,
          rating:body.rating,
          price:body.price,
          quantity:body.quantity,
          description:body.description
        },
      }
      const result = await toyCollections.updateOne(filter, updateDoc);
      res.send(result)

    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('toy market place')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})