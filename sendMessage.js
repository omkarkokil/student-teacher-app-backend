// Load the AWS SDK for Node.js
let AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({ region: "REGION" });
require("dotenv").config();

// AKIAWKBQSG3PTHQ7SGOR
// c7dKmkLVo0IAIECcpuHGODv4DE2h/D8ar0eW0GOC
// Create an SQS service object

console.log(
  "check this",
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY
);

console.log("runn");

let sqs = new AWS.SQS({
  apiVersion: "2012-11-05",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

let params = {
  MessageAttributes: {
    Title: {
      DataType: "String",
      StringValue: "The Whistler",
    },
    Author: {
      DataType: "String",
      StringValue: "John Grisham",
    },
    WeeksOn: {
      DataType: "Number",
      StringValue: "6",
    },
  },
  MessageGroupId: "default",
  MessageDeduplicationId: uuidv4(),
  MessageBody: "Test MEssage.",
  QueueUrl: "https://sqs.ap-south-1.amazonaws.com/433893553887/test_queue.fifo",
};

sqs.sendMessage(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});
