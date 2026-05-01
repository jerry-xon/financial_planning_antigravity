import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'node:path'

export type FinPlanRegionalStackProps = cdk.StackProps & {
  envName: 'staging' | 'prod'
  domainName: string
}

export class FinPlanRegionalStack extends cdk.Stack {
  public readonly webBucket: s3.IBucket
  public readonly albDnsName: string

  constructor(scope: Construct, id: string, props: FinPlanRegionalStackProps) {
    super(scope, id, props)

    const { envName } = props

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    })

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTask', {
      cpu: 256,
      memoryLimitMiB: 512,
    })

    const asset = new ecr_assets.DockerImageAsset(this, 'ApiImage', {
      directory: path.join(__dirname, '..', '..', '..'),
      file: 'apps/api/Dockerfile',
    })

    const container = taskDefinition.addContainer('Api', {
      image: ecs.ContainerImage.fromDockerImageAsset(asset),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logGroup: new logs.LogGroup(this, 'ApiLogs', {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '8080',
      },
    })

    container.addPortMappings({ containerPort: 8080, protocol: ecs.Protocol.TCP })

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
    })

    const listener = alb.addListener('Http', {
      port: 80,
      open: true,
    })

    const service = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition,
      desiredCount: envName === 'prod' ? 2 : 1,
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    })

    listener.addTargets('ApiTg', {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/api/health',
        healthyHttpCodes: '200',
      },
    })

    const webBucket = new s3.Bucket(this, 'WebBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    })

    this.webBucket = webBucket
    this.albDnsName = alb.loadBalancerDnsName

    new cdk.CfnOutput(this, 'WebBucketName', { value: webBucket.bucketName })
    new cdk.CfnOutput(this, 'AlbDnsName', { value: alb.loadBalancerDnsName })
    new cdk.CfnOutput(this, 'VpcId', { value: vpc.vpcId })
  }
}
