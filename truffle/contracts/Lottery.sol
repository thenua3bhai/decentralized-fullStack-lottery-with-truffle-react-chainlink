// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;
//For Data Feeds
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//For Random Number
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Lottery is VRFConsumerBaseV2 {
    address public manager;
    address payable[] public players;

    AggregatorV3Interface internal priceFeed;
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID. from vrf.chain.link
    uint64 s_subscriptionId = 2397;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;
    uint public rand;

    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    /** for VRF
     * HARDCODED FOR  mumbai vrf coordinater after checksum address:0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
     */

    /** For Price Feed
     * Network: Polygon Mumbai
     * Aggregator: ETH/USD
     * Address of Chainlink contract: 0x0715A7794a1dc8e42615F059dD6e406A6594651A
     */

    //Since we are deploying our contract on Mumbai so we will talk to that  eth/usd chanlink contract which is on mumbai, so we can get price feed,,

    constructor()
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
    {
        manager = msg.sender;
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A
        );
        COORDINATOR = VRFCoordinatorV2Interface(
            0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
        );
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(payable(msg.sender));
    }

    function random() private view returns (uint) {}

    function pickWinner() public restricted {
        RequestStatus memory request = s_requests[lastRequestId];
        rand = request.randomWords[0];
        uint index = rand % players.length;
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function requestRandomWords()
        external
        restricted
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }
}
