const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;

 
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wa67.mongodb.net/?retryWrites=true&w=majority`

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){

    try{
        await client.connect();
        console.log('database connected');

        const partCollection = client.db('manufacturer-website').collection('parts');

app.get('/parts',async(req, res)=>{
  const query = {};
  const cursor = partCollection.find(query);
  const parts = await cursor.toArray();
  res.send(parts) ;
});
    
        
    }

    finally{

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello from manufacturer website!')
})

app.listen(port, () => {
  console.log(`Manufacturer website listening on port ${port}`)
})