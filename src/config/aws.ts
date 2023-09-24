import AWS = require('aws-sdk')

AWS.config.credentials = new AWS.EnvironmentCredentials('AWS')

AWS.config.update({ region: process.env.AWS_REGION });

export const s3 = new AWS.S3()
