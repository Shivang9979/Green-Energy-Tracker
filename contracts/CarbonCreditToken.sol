// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC721 {
    uint256 private _tokenIds;

    struct CarbonCredit {
        uint256 amount;          // CO2 offset in tons
        string source;           // Source of offset (e.g., "Solar Project A")
        uint256 timestamp;       // Creation timestamp
        uint256 emissionData;    // Simulated IoT emission data
        bool isActive;           // Whether credit is active/valid
    }

    // Mappings
    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(address => uint256) public companyEmissions;
    mapping(address => uint256[]) public companyTokens;
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event CreditMinted(
        uint256 indexed tokenId,
        address indexed company,
        uint256 amount,
        string source,
        uint256 emissionData
    );

    event EmissionRecorded(
        address indexed company,
        uint256 emissionAmount,
        uint256 timestamp
    );

    event CreditOffset(
        address indexed company,
        uint256 indexed tokenId,
        uint256 amount
    );

    constructor() ERC721("Carbon Credit Token", "CCT") {}

    function recordEmission(uint256 emissionAmount) public {
        companyEmissions[msg.sender] += emissionAmount;
        emit EmissionRecorded(msg.sender, emissionAmount, block.timestamp);
    }

    function tokenExists(uint256 tokenId) public view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds;
    }

    function mintCredit(
        uint256 amount,
        string memory source,
        uint256 emissionData
    ) public returns (uint256) {
        require(amount > 0, "Amount must be positive");
        require(bytes(source).length > 0, "Source required");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        CarbonCredit memory newCredit = CarbonCredit({
            amount: amount,
            source: source,
            timestamp: block.timestamp,
            emissionData: emissionData,
            isActive: true
        });

        carbonCredits[newTokenId] = newCredit;
        companyTokens[msg.sender].push(newTokenId);

        _safeMint(msg.sender, newTokenId);

        emit CreditMinted(newTokenId, msg.sender, amount, source, emissionData);

        return newTokenId;
    }

    function offsetEmissions(uint256 tokenId) public {
        require(tokenExists(tokenId), "Token doesn't exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(carbonCredits[tokenId].isActive, "Credit not active");

        CarbonCredit storage credit = carbonCredits[tokenId];
        require(companyEmissions[msg.sender] >= credit.amount, "Insufficient emissions to offset");

        companyEmissions[msg.sender] -= credit.amount;
        credit.isActive = false;

        emit CreditOffset(msg.sender, tokenId, credit.amount);
    }

    function getCompanyTokens(address company) public view returns (uint256[] memory) {
        return companyTokens[company];
    }

    function getCreditDetails(uint256 tokenId) public view returns (
        uint256 amount,
        string memory source,
        uint256 timestamp,
        uint256 emissionData,
        bool isActive
    ) {
        require(tokenExists(tokenId), "Token doesn't exist");
        CarbonCredit memory credit = carbonCredits[tokenId];
        return (
            credit.amount,
            credit.source,
            credit.timestamp,
            credit.emissionData,
            credit.isActive
        );
    }

    function getEmissions(address company) public view returns (uint256) {
        return companyEmissions[company];
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(tokenExists(tokenId), "Token doesn't exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(tokenExists(tokenId), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
