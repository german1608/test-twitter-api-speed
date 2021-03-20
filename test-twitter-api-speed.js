#!/usr/bin/env node
const Twit = require('twit')

const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const async = require('async')
const performance = require('perf_hooks').performance

const args = yargs(hideBin(process.argv))
    .option('numCalls', {
        type: 'number',
        description: 'Number of calls to statuses/show',
        default: 11
    })
    .option('tweetId', {
        type: 'number',
        description: 'Tweet id to call Twitter API',
        default: '1373203066556588034'
    })
    .boolean('parallel')
    .demandOption('consumerKey', 'Twitter Consumer Key is required')
    .demandOption('consumerSecret', 'Twitter Consumer Secret is required')
    .help()
    .argv

const client = new Twit({
    consumer_key: args.consumerKey,
    consumer_secret: args.consumerSecret,
    app_only_auth: true
})

const callTwitter = async (i, cb) => {
    const startTime = performance.now()
    const response = await client.get('statuses/show', {
        id: args.tweetId,
        tweet_mode: 'extended'
    })
    const endTime = performance.now()
    return {
        run: i + 1,
        msSpent: endTime - startTime
    }

}

const gatherResults = (err, results) => {
    if (err) throw err

    console.log('Corrida,Tiempo (ms)')
    results.forEach(result => {
        console.log(`${result.run},${result.msSpent}`)
    })
}

if (args.parallel) {
    console.log('Running tests in parallel')
    async.times(args.numCalls, callTwitter, gatherResults)
} else {
    console.log('Running tests in sequential')
    async.timesSeries(args.numCalls, callTwitter, gatherResults)
}
