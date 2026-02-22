import express from "express"
import mongoose from "mongoose"
import contentRoutes from "./routes/content.routes"

const app = express()
const port = 3000

app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use("/api/content", contentRoutes)

mongoose.connect("mongodb://127.0.0.1:27017/prepshelf")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err))

app.get("/", (_, res) => {
  res.send("Backend Running")
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
