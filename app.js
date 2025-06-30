const express = require("express");
// const sequelize = require("./config/database");
// test two four
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadToS3 } = require("./app/Upload/uploads3");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// test account not checking might be issue regading not pre data inside the
app.use("/api/v1", require("./app/User/route"));
app.use("/api/v1", require("./app/post/route"));
app.use("/api/v1", require("./app/Teacher/route"));
app.use("/api/v1", require("./app/Student/route"));

app.use("/static", express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("hello your app is running");
});
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isCSVExtension = ext === ".csv";
    const isCSVMime =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "text/plain";
    if (isCSVExtension && isCSVMime) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

app.get("/uploadToS3", uploadToS3);

// test commit

app.get("/getDummyCoupans", (req, res) => {
  try {
    const coupons = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      coupon: `SPRING${i + 1}`,
      discount: Math.floor(Math.random() * 50) + 1,
      valid: new Date(
        Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ),
    }));

    return res.json({
      message: "Dummy coupons generated successfully",
      coupons,
    });
  } catch (error) {
    console.log(error);
  }
});

// process 100 lines

// by using stream.on("data") and write to output file

app.get("/api/v1/dummy-emails", async (req, res) => {
  const csvPath = path.join(__dirname, "input.csv");
  const filePath = path.join(__dirname, "output.csv");

  const stream = fs.createReadStream(csvPath, {
    encoding: "utf8",
    highWaterMark: 2.5 * 1024,
  });
  const writeStream = fs.createWriteStream(filePath);

  stream.on("error", (err) => {
    writeStream.end();
    return res.status(500).json({ error: err.message });
  });

  let leftover = "";
  let emails = [];
  writeStream.write("email,domain\n");

  stream.on("data", (chunk) => {
    let data = leftover + chunk;
    let lines = data.split("\n");
    console.log(`🚀 ~ lines:`, lines?.length);
    leftover = lines.pop();
    console.log(`🚀 ~ leftover:`, leftover);

    for (let line of lines) {
      if (!line.includes("@")) continue;
      line = line.trim();
      emails.push(line);

      if (emails.length === 100 || lines?.length < 100) {
        writeChunk(emails, writeStream);
        stream.resume();
        emails = [];
      }

      // if (lines?.length < 100 && leftover.trim() !== "") {
      //   stream.pause();
      //   writeChunk(emails, writeStream);
      //   emails.push(leftover);
      //   leftover = "";
      // }
    }
  });

  stream.on("end", async () => {
    if (leftover.trim() !== "" || leftover.includes("@")) {
      emails.push(leftover);
    }
    if (emails.length > 0) {
      await writeChunk(emails, writeStream, stream);
    }
    writeStream.end();
  });

  return res.json({
    message: "File created successfully",
  });
});

async function writeChunk(chunk, writeStream, stream) {
  const emails =
    chunk
      .map((line) => {
        return `${line},${line.split("@")[1]}`;
      })
      .join("\n") + "\n";

  return new Promise((resolve) => {
    writeStream.write(emails, resolve);
  });
}

app.get("/health", (req, res) => res.status(200).send("OK"));

app.get("/api/v1/cluster", (req, res) => {
  const clusters = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "India Cluster" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [75, 20],
              [85, 20],
              [85, 28],
              [75, 28],
              [75, 20],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "USA Cluster" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-105, 35],
              [-95, 35],
              [-95, 42],
              [-105, 42],
              [-105, 35],
            ],
          ],
        },
      },
    ],
  };
  return res.json(clusters);
});

// app.get("/api/v1/dummy-emails", async (req, res) => {
//   try {
//     const inputPath = path.join(__dirname, "input.csv");
//     const outputPath = path.join(__dirname, "output.csv");
//     const stream = fs.createReadStream(inputPath);
//     const writeStream = fs.createWriteStream(outputPath);

//     const rl = readline.createInterface({
//       input: readStream,
//       crlfDelay: Infinity,
//     });

//     let chunk = [];

//     writeStream.write("email,domain\n");

//     for await (const line of rl) {
//       if (line === "" || !line.includes("@")) continue;
//       chunk.push(line);
//       if (chunk.length === 100) {
//         await writeChunk(chunk, writeStream);
//         chunk = [];
//       }
//     }

//     if (chunk.length > 0) {
//       await writeChunk(chunk, writeStream);
//     }

//     writeStream.end();
//     return res.json({
//       message: "File processed successfully",
//       inputFile: inputPath,
//       outputFile: outputPath,
//     });
//   } catch (error) {
//     return res.status(500).json({ error });
//   }
// });

app.post("/api/v1/upload-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const timestamp = Date.now().toString();
    const uploadDir = path.join(__dirname, "uploads", timestamp);
    fs.mkdirSync(uploadDir, { recursive: true });

    const inputPath = path.join(uploadDir, "input.csv");
    fs.renameSync(req.file.path, inputPath);

    // const buffer = Buffer.alloc(2);
    // const fd = fs.openSync(inputPath, "r");
    // fs.readSync(fd, buffer, 0, 2, 0);
    // fs.closeSync(fd);
    // const isExecutable = buffer[0] === 0x4d && buffer[1] === 0x5a;
    // if (isExecutable) {
    //   fs.unlinkSync(inputPath);
    //   fs.rmdirSync(uploadDir, { recursive: true });
    //   return res
    //     .status(400)
    //     .json({ error: "Executable file detected (MZ header)." });
    // }

    const emails = [];
    let leftover = "";
    const stream = fs.createReadStream(inputPath, { encoding: "utf8" });

    stream.on("data", (chunk) => {
      leftover += chunk;
      const lines = leftover.split("\n");
      leftover = lines.pop().join("\n");
      for (line of lines) {
        if (line.trim() === "" || !line.includes("@")) continue;
        const domain = line.split("@")[1];
        emails.push({
          email: line.split("\r")[0],
          domain: domain.split("\r")[0],
        });
      }
    });

    stream.on("end", () => {
      if (leftover.trim() !== "" && leftover.includes("@")) {
        const domain = leftover.split("@")[1];
        emails.push({
          email: leftover.split("\r")[0],
          domain: domain.split("\r")[0],
        });
      }

      const outputPath = path.join(uploadDir, "output.csv");
      const writeStream = fs.createWriteStream(outputPath);
      writeStream.write("email,domain\n");
      emails.forEach((email) => {
        writeStream.write(`${email.email},${email.domain}\n`);
      });
      writeStream.end();

      return res.json({
        message: "File uploaded and processed successfully",
        count: emails.length,
        inputFile: inputPath,
        outputFile: outputPath,
      });
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ message: error.message });
  }
});

app.get("/", function (req, res) {
  console.log(req.ip);
  console.log(req.headers);
  console.log(req.hostname);
  console.log(req.url);
  console.log(req.path);
  console.log(req.xhr);
  console.log(req.method);
  console.log(req.secure);
  console.log(req.cookies);
  res.send("Hello world!");
});

app.listen(4000, () => console.log("Server running at http://localhost:4000"));

// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("Database synced");
//     app.listen(4000, () =>
//       console.log("Server running at http://localhost:4000")
//     );
//   })
//   .catch((err) => console.error("DB Connection Error:", err));
