pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IOracle {
    struct Observation {
        address scout;
        uint256 timestamp;
        uint256 data;
    }

    function updateScoutStatus(address _scout, bool _isScout) external;

    function updateData(bytes32 _key, uint256 _observation) external;

    function getData(bytes32 _key)
        external
        view
        returns (uint256 timestamp, uint256 data);
}

contract Oracle is IOracle, Ownable {
    mapping(address => bool) public scouts;
    mapping(bytes32 => Observation) observations;

    modifier ownerOrScout() {
        require(
            scouts[msg.sender] == true || msg.sender == owner(),
            "you are not the owner or a scout"
        );
        _;
    }

    function updateScoutStatus(address _scout, bool _isScout)
        external
        override
        onlyOwner
    {
        scouts[_scout] = _isScout;
    }

    function updateData(bytes32 _key, uint256 _observation)
        external
        override
        ownerOrScout
    {
        observations[_key] = Observation(
            msg.sender,
            block.timestamp,
            _observation
        );
    }

    function getData(bytes32 _key)
        external
        view
        override
        returns (uint256 timestamp, uint256 data)
    {
        require(
            observations[_key].timestamp != 0,
            "data with the given key does not exist"
        );
        return (observations[_key].timestamp, observations[_key].data);
    }
}
