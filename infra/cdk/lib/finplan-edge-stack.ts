import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export type FinPlanEdgeStackProps = cdk.StackProps & {
  envName: 'staging' | 'prod'
  domainName: string
  albDnsName: string
}

export class FinPlanEdgeStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props: FinPlanEdgeStackProps) {
    super(scope, id, {
      ...props,
      env: { account: props.env?.account, region: 'us-east-1' },
      crossRegionReferences: true,
    })

    const { envName, domainName, albDnsName } = props

    // Prod and staging cannot share the same CloudFront alternate domain names (CNAMEs).
    // Staging uses dedicated hostnames so prod can attach app.{domain} / api.{domain}.
    const appFqdn = envName === 'prod' ? `app.${domainName}` : `app-staging.${domainName}`
    const apiFqdn = envName === 'prod' ? `api.${domainName}` : `api-staging.${domainName}`

    const webBucket = new s3.Bucket(this, 'WebBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    })

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    })

    const cert = new acm.Certificate(this, 'CloudFrontCert', {
      domainName: appFqdn,
      subjectAlternativeNames: [apiFqdn],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })

    const oac = new cloudfront.S3OriginAccessControl(this, 'WebOAC', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    })

    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(webBucket, {
      originAccessControl: oac,
    })

    const apiOrigin = new origins.HttpOrigin(albDnsName, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      httpPort: 80,
    })

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `finplan-${envName}`,
      defaultRootObject: 'index.html',
      domainNames: [appFqdn, apiFqdn],
      certificate: cert,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    })

    new route53.ARecord(this, 'AppAliasV4', {
      zone: hostedZone,
      recordName: appFqdn,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    })

    new route53.AaaaRecord(this, 'AppAliasV6', {
      zone: hostedZone,
      recordName: appFqdn,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    })

    new route53.ARecord(this, 'ApiAliasV4', {
      zone: hostedZone,
      recordName: apiFqdn,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    })

    new route53.AaaaRecord(this, 'ApiAliasV6', {
      zone: hostedZone,
      recordName: apiFqdn,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    })

    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: this.distribution.distributionDomainName })
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
    })
    new cdk.CfnOutput(this, 'WebBucketName', { value: webBucket.bucketName })
  }
}
