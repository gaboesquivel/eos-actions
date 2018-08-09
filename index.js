'use strict'

const eosCamelApi = require('@eoscostarica/eosjs-camel-api')
const Promise = require("bluebird")
const prettyJson = require('prettyjson')
const chalk = require('chalk')
const zip = require('lodash.zip')


const run = async () => {
  const endpoints = [
      'https://api.eosio.cr',
      'http://bp.cryptolions.io:8888',
      'https://api.eosnewyork.io:443',
      'https://eos.greymass.com:443'
      ]

  const apis = endpoints.map(httpEndpoint => eosCamelApi.getInstance({httpEndpoint}))
  const apiInfoCalls = apis.map(api => api.getInfo({}))
  const apisChainPromises = Promise.all(apiInfoCalls)

  // get Transactions data
  const apiActionsCalls = apis.map(api => api.getActions('eoshindustan', -1, -5))
  const apisActionsPromises = Promise.all(apiActionsCalls)

  // await data
  const [apisChainData, apisActionsData] = await Promise.all([apisChainPromises, apisActionsPromises])

  // zip data. indexes 0:endpoint, 1:apiInstance, 2:apiChainInfo
  const data = zip(endpoints, apis, apisChainData, apisActionsData)
  
  for (const [httpEndpoint, api, chainData, actionsData] of data) {

    
    const printData = {
      serverVersion: chainData.serverVersion,
      chainId: chainData.chainId,
      headBlockNum: chainData.chainId,
      lastIrreversibleBlockNum: chainData.lastIrreversibleBlockNum,
      actionsResponse: {
        numberOfActions: actionsData.actions.length,
        lastIrreversibleBlockNum: actionsData.lastIrreversibleBlockNum
      }
    }

    console.log(chalk.grey(`====== ${httpEndpoint} ======`))
    console.log(prettyJson.render(printData))
  }
  
}

run()