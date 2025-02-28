import { PrismaClient } from "@prisma/client";
import { app } from "./app.js"

const prisma = new PrismaClient();

prisma.$connect().then(() => {
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at Port:${process.env.PORT}`);
        console.log(`Visit: https://localhost:${process.env.PORT || 8000}`);
    });
    console.log("Connected to Database");
})
.catch((error) => {
    console.log("Failed!!!",error);
})
