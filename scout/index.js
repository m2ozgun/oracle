const fetch = require('node-fetch')
const Web3 = require('web3')
const TruffleContract = require('@truffle/contract')
const OracleContract = require('../build/contracts/Oracle.json')

const DUMMY_BYTES32 =
  '0x7465737400000000000000000000000000000000000000000000000000000000'

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

const web3 = new Web3(provider)
const oracle = TruffleContract(OracleContract)

async function fetchData() {
  const accounts = await web3.eth.getAccounts()
  oracle.setProvider(provider)
  const oracleInstance = await oracle.deployed()

  const price = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum',
  )
    .then((res) => res.json())
    .then((json) => json[0].current_price)
    .catch(function (error) {
      console.log(error)
    })

  console.log('Price from API:', price)
  const priceInCents = price * 100
  await oracleInstance.updateData(DUMMY_BYTES32, priceInCents, {
    from: accounts[0],
  })

  const res = await oracleInstance.getData(DUMMY_BYTES32, {
    from: accounts[0],
  })

  console.log('Price from Chain:', res.data.toNumber())
  console.log(
    'Timestamp from Chain:',
    new Date(res.timestamp.toString() * 1000),
  )
}


setInterval(async function () {
  await fetchData()
}, 3 * 1000)
