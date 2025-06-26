// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });
require("dotenv").config();

var sqs = new AWS.SQS({
  apiVersion: "2012-11-05",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = "testbuck1235";

const queueURL =
  "https://sqs.ap-south-1.amazonaws.com/433893553887/test_queue.fifo";

const params = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};

sqs.receiveMessage(params, function (err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
    console.log("Received Messages:", data.Messages);

    const sqsMessage = data.Messages[0];
    let messageBody;
    try {
      messageBody = JSON.parse(sqsMessage.Body);
    } catch (e) {
      messageBody = sqsMessage.Body;
      console.warn(
        "SQS message body is not JSON. Using raw string:",
        messageBody
      );
    }
    console.log(`🚀 ~ messageBody:`, messageBody);

    s3.getObject(
      {
        Bucket: bucketName,
        Key: "books/books.json",
      },
      function (err, data) {
        let existingData = [];
        if (err && err.code === "NoSuchKey") {
          console.warn("S3 object does not exist, creating new file.");
        } else if (err) {
          console.log("Error getting object from S3:", err);
          return;
        } else if (data && data.Body) {
          try {
            existingData = JSON.parse(data.Body.toString("utf-8"));
          } catch (error) {
            console.warn("Error parsing S3 object data:", error);
          }
        }
        console.log(`🚀 ~ existingData:`, existingData);
        existingData.push({
          data: messageBody,
        });

        const uploadParams = {
          Bucket: bucketName,
          Key: "books/books.json",
          Body: JSON.stringify(existingData, null, 2),
          ContentType: "application/json",
        };

        s3.putObject(uploadParams, (err, data) => {
          if (err) {
            console.error("S3 Upload Error:", err);
          } else {
            console.log("S3 Upload Success: all_books.json updated.");
          }
        });
      }
    );

    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});
