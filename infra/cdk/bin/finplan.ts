#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { FinPlanEdgeStack } from '../lib/finplan-edge-stack'
import { FinPlanRegionalStack } from '../lib/finplan-regional-stack'

const app = new cdk.App()

const envName = app.node.tryGetContext('env')
if (envName !== 'staging' && envName !== 'prod') {
  throw new Error('Missing/invalid context `env`. Use: cdk deploy -c env=staging|prod')
}

const account = '903685415164'
const domainName = 'wealthmap.app'

const regional = new FinPlanRegionalStack(app, `FinPlan-${envName}-Regional`, {
  envName,
  domainName,
  env: { account, region: 'ap-south-1' },
  crossRegionReferences: true,
})

const edge = new FinPlanEdgeStack(app, `FinPlan-${envName}-Edge`, {
  envName,
  domainName,
  webBucket: regional.webBucket,
  albDnsName: regional.albDnsName,
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
})

edge.addDependency(regional)

app.synth()
