require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();

app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('uploads'))

app.get('', async (req, res) => {
  res.send({ message: 'Awesome it works' });
});

app.use('/api/upload', require("./routes/api/upload.route"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));