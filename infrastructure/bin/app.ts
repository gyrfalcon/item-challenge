#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core'
import { ExamItemService } from '../lib/stack'

const app = new cdk.App()
new ExamItemService(app, 'ExamItemService')
