const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
  });
}




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


        const userCollection = client.db('bike_parts').collection('users'); 

        const bookingCollection = client.db('bike_parts').collection('bookings');
        
app.get('/part',async(req, res)=>{
  const query = {};
  const cursor = partCollection.find(query);
  const parts = await cursor.toArray();
  res.send(parts) ;
});

app.get('/part',async(req, res)=>{
  const newPart = req.body;
  const result = await partCollection.insertOne(newPart);
  res.send(result) ;
});



app.get('/part/:id',async(req,res)=>{
  const id = req.params.id;
  const query ={_id:ObjectId(id)};
  const part = await partCollection.findOne(query);
  res.send(part);

});

app.post('/booking', async (req, res) => {
  const booking = req.body;
  const result = await bookingCollection.insertOne(booking);
  res.send(result);
});



app.get('/booking', verifyJWT, async (req, res) => {
  const email = req.query.email;
  const decodedEmail = req.decoded.email;
  if (email === decodedEmail) {
      const query = { email: email };
      const bookings = await bookingCollection.find(query).toArray();
      return res.send(bookings);
  }
  else {
      return res.status(403).send({ message: 'forbidden access' });
  }
});

app.get('/user', verifyJWT, async (req, res) => {
  const users = await userCollection.find().toArray();
  res.send(users);
});


app.put('/user/:email', async (req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
      $set: user,
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  res.send({ result, token });
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