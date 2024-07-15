import express from 'express';
import bodyParser from 'body-parser';
import {connectToDatabase} from './db.js';
import { ObjectId } from 'mongodb';

const app = express();
const port = 5000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let lastDate;

const dbPromise = connectToDatabase();

app.get('/', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection('list');

    // Retrieve items from the default list
    const todoItems = await collection.find({ list: "default" }).toArray();

    const now = new Date();
    if (lastDate && now.getDate() !== lastDate.getDate()) {
        // Clear items if the date has changed
        await collection.deleteMany({ list: "default" });
        todoItems.length = 0;
    }
    lastDate = now;

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };
    const day = now.toLocaleDateString("en-US", options);

    res.render('index.ejs', {
        listTitle: day,
        newListItems: todoItems,
    });
});

app.post('/', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection('list');
    const list = req.body.list === "Work List" ? "work" : "default";
    const item = { name: req.body.newItem, list: list, checked: false };

    await collection.insertOne(item);
    res.redirect(list === "work" ? '/work' : '/');
});

app.post('/update', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection('list');
    const { id, checked } = req.body;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { checked: checked === 'true' } });
    res.redirect('back');
});

app.get("/work", async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection('list');

    // Retrieve items from the work list
    const workItems = await collection.find({ list: "work" }).toArray();

    res.render("index.ejs", {
        listTitle: "Work List",
        newListItems: workItems,
    });
});

app.post("/work", async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection('list');
    const item = { name: req.body.newItem, list: "work", checked: false };

    await collection.insertOne(item);
    res.redirect("/work");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
