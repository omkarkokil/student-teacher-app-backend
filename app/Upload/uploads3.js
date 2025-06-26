const AWS = require("aws-sdk");
const { PassThrough } = require("stream");

AWS.config.update({ region: "ap-south-1" });

const s3 = new AWS.S3();
const BUCKET_NAME = "testbuck1235";
const OUTPUT_KEY = "output.csv";

const writeChunk = (emails, writeStream) => {
  for (const email of emails) {
    if (!email.includes("@")) continue;
    const [_, domain] = email.trim().split("@");
    writeStream.write(`${email.trim()},${domain}\n`);
  }
};

const uploadToS3 = async (req, res) => {
  try {
    const inputStream = s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: "input.csv",
      })
      .createReadStream({ encoding: "utf8" });

    const passThrough = new PassThrough();
    const uploadPromise = s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: OUTPUT_KEY,
        Body: passThrough,
        ContentType: "text/csv",
      })
      .promise();

    let leftover = "";
    let emails = [];

    passThrough.write("email,domain\n");

    inputStream.on("data", (chunk) => {
      inputStream.pause();
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop();

      console.log(`🚀 ~ line:`, lines?.length);
      for (let line of lines) {
        if (!line.includes("@")) continue;
        emails.push(line.trim());
        if (emails.length === 100 || lines?.length < 100) {
          writeChunk(emails, passThrough);
          inputStream.resume();
          emails = [];
        }
      }
    });

    inputStream.on("end", async () => {
      if (leftover.trim().includes("@")) {
        emails.push(leftover.trim());
      }
      if (emails.length > 0) {
        writeChunk(emails, passThrough);
      }

      passThrough.end();
      await uploadPromise;

      return res.json({
        message: "File processed and uploaded to S3 successfully",
        outputKey: OUTPUT_KEY,
      });
    });

    inputStream.on("error", (err) => {
      passThrough.destroy();
      return res
        .status(500)
        .json({ error: "Error reading from S3", details: err.message });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

module.exports = { uploadToS3 };
