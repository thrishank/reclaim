import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchMerkleTree,
  fetchTreeConfigFromSeeds,
  createTree,
  mplBubblegum,
  mintV1,
} from "@metaplex-foundation/mpl-bubblegum";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";

const umi = createUmi(
  "https://devnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079"
)
  .use(mplBubblegum())
  .use(mplTokenMetadata())
  .use(
    irysUploader({
      // mainnet address: "https://node1.irys.xyz"
      address: "https://devnet.irys.xyz",
    })
  );

const wallet = process.env.WALLET;

let keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(JSON.parse(wallet!))
);
umi.use(keypairIdentity(keypair));

export async function GET() {
  // const merkleTree = generateSigner(umi);

  // console.log(
  //   "Merkle Tree Public Key:",
  //   merkleTree.publicKey,
  //   "\nStore this address as you will need it later."
  // );

  // console.log("Creating Merkle Tree...");

  // const createTreeTx = await createTree(umi, {
  //   merkleTree,
  //   maxDepth: 20,
  //   maxBufferSize: 64,
  //   canopyDepth: 14,
  // });

  // await createTreeTx.sendAndConfirm(umi);

  // const collectionId = generateSigner(umi);
  // console.log(collectionId.publicKey.toString());
  // const collectionImageFile = fs.readFileSync("./public/image.png");

  // const genericCollectionImageFile = createGenericFile(
  //   collectionImageFile,
  //   "collection.png"
  // );

  // const collectionImageUri = await umi.uploader.upload([
  //   genericCollectionImageFile,
  // ]);

  // const collectionMetadata = {
  //   name: "Aadhar NFT Collection",
  //   image: collectionImageUri[0],
  //   properties: {
  //     files: [
  //       {
  //         uri: collectionImageUri[0],
  //         type: "image/png",
  //       },
  //     ],
  //   },
  // };

  // console.log("Uploading Collection Metadata...");
  // const collectionMetadataUri = await umi.uploader.uploadJson(
  //   collectionMetadata
  // );

  // console.log("Creating Collection NFT...");
  // await createNft(umi, {
  //   mint: collectionId,
  //   name: "Aadhar cNFT Collection",
  //   uri: collectionMetadataUri,
  //   isCollection: true,
  //   sellerFeeBasisPoints: percentAmount(0),
  // }).sendAndConfirm(umi);

  const nftImageFile = fs.readFileSync("./public/image.png");

  const genericNftImageFile = createGenericFile(nftImageFile, "nft.png");

  const nftImageUri = await umi.uploader.upload([genericNftImageFile]);

  const nftMetadata = {
    name: "My Aadhar cNFT",
    image: nftImageUri[0],
    attributes: [
      {
        trait_type: "ageAbove18",
        value: "true",
      },
    ],
    properties: {
      files: [
        {
          uri: nftImageUri[0],
          type: "image/png",
        },
      ],
    },
  };

  console.log("Uploading cNFT metadata...");
  const nftMetadataUri = await umi.uploader.uploadJson(nftMetadata);

  const newOwner = publicKey("ADmMCv4Xj3iHAsAWfRshRqVXW2DKWqpt4xh2oeeViwu1");

  console.log("Minting Compressed NFT to Merkle Tree...");

  const { signature } = await mintV1(umi, {
    leafOwner: newOwner,
    merkleTree: publicKey("GUFosYSqtwKR9XyChRuDLqh6Y6hqWxLeZqsCgxu1Cufu"),
    metadata: {
      name: "My cNFT",
      uri: nftMetadataUri, // Either use `nftMetadataUri` or a previously uploaded uri.
      sellerFeeBasisPoints: 500, // 5%
      collection: {
        key: publicKey("ADQCenQzVW9QJKQdfWTWhphJPx2tGqnFVGBtcGHUzwei"),
        verified: false,
      },
      creators: [
        { address: umi.identity.publicKey, verified: true, share: 100 },
      ],
    },
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

  console.log("Minted cNFT to Merkle Tree:", signature.toString());

  return Response.json({ message: "helo" });
}
