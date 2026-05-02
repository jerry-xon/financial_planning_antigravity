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

/** When true, CloudFront is deployed without custom domain names / ACM / Route53. Use if app.{domain} is still attached elsewhere (409). Re-deploy with false after freeing hostnames. */
const skipEdgeCustomDomains = app.node.tryGetContext('skipEdgeCustomDomains') === 'true'

const account = '903685415164'
const domainName = 'wealthmap.app'

const regional = new FinPlanRegionalStack(app, `FinPlan-${envName}-Regional`, {
  envName,
  domainName,
  env: { account, region: 'ap-south-1' },
  crossRegionReferences: true,
})

new FinPlanEdgeStack(app, `FinPlan-${envName}-Edge`, {
  envName,
  domainName,
  albDnsName: regional.albDnsName,
  skipCustomDomains: skipEdgeCustomDomains,
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
})

app.synth()
