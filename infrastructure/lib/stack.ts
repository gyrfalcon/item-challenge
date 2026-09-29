import * as cdk from 'aws-cdk-lib/core'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

export class ExamItemService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const api = new apigateway.RestApi(this, 'api', {
      description: 'ExamItem Service API Gateway',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    })

    const getExamItemLambda = new NodejsFunction(this, 'get-exam-item-lambda', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'getItemHandler',
      entry: 'src/handlers/index.ts',
    })
    const createExamItemLambda = new NodejsFunction(this, 'create-exam-item-lambda', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'createItemHandler',
      entry: 'src/handlers/index.ts',
    })
    const updateExamItemLambda = new NodejsFunction(this, 'update-exam-item-lambda', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'updateItemHandler',
      entry: 'src/handlers/index.ts',
    })

    const items = api.root.addResource('items');

    items.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createExamItemLambda, { proxy: true }),
    )


    const item = items.addResource('{itemId}')

    item.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getExamItemLambda, { proxy: true }),
    )
    item.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateExamItemLambda, { proxy: true }),
    )
  }
}
