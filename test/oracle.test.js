const { expect } = require('chai')
const chai = require('chai')
chai.use(require('chai-as-promised'))

const Oracle = artifacts.require('Oracle')

const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

const DUMMY_BYTES32 = '0x7465737400000000000000000000000000000000000000000000000000000000'

contract('Oracle Contract', accounts => {
    beforeEach(async () => {
        oracle = await Oracle.new()
      })

      describe('updateScoutStatus()', () => {
        it('should add scout', async () => {
            await expect(oracle.updateScoutStatus(accounts[1], true)).to.be.fulfilled
            expect(await oracle.scouts(accounts[1])).to.be.true
        })

        it('should remove scout', async () => {
            await oracle.updateScoutStatus(accounts[1], true)
            await oracle.updateScoutStatus(accounts[1], false)
            expect(await oracle.scouts(accounts[1])).to.be.false
        })

        it('should not add scout if not admin', async () => {
            await expect(oracle.updateScoutStatus(accounts[1], true, { from: accounts[2]})).to.be.rejectedWith(/owner/)
        })
    })

    describe('updateData()', () => {
        it('should update data', async () => {
            await expect(oracle.updateData(DUMMY_BYTES32, 1)).to.be.fulfilled
        })
        it('should not update data if not scout', async () => {
            await expect(oracle.updateData(DUMMY_BYTES32, 1, { from: accounts[2]})).to.be.rejectedWith(/not the owner or a scout/)
        })
    })

    describe('getData()', () => {
        it('should get data', async () => {
            await oracle.updateData(DUMMY_BYTES32, 1)
            const res = await oracle.getData(DUMMY_BYTES32)
            await expect(res.data).to.be.a.bignumber.equal(new BN(1))
        })
        it('should not get data if key does not exist', async () => {
            await expect(oracle.getData(DUMMY_BYTES32)).to.be.rejectedWith(/key does not exist/)
        })
    })
})
 