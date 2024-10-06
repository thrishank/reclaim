import generateImage from "@/app/image";
import dbConnect from "@/lib/dbConnect";
import aadhar from "@/model/aadhar";

import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import QRCode from "qrcode";

const headers = createActionHeaders();

const APP_ID = "0x78b8217779E218Ad450f3b45070E092E9eA5aD96";
const APP_SECRET =
  "0xaba357f8a74bdf32d92130486378f2c742994e416443b46cf52f103f76f13253";
const PROVIDER_ID = "5e1302ca-a3dd-4ef8-bc25-24fcc97dc800";

const init = async () => {
  try {
    return await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function GET() {
  const reclaimProofRequest = await init();
  const url = await reclaimProofRequest!.getRequestUrl();
  const qrCodeDataUrl = await QRCode.toDataURL(url);

  await dbConnect();
  const entry = await aadhar.create({});
  const id = entry._id.toString();

  reclaimProofRequest!.startSession({
    async onSuccess(proof) {
      const user_data = JSON.parse(proof.claimData.context).extractedParameters;
      await aadhar.updateOne(
        { _id: entry._id },
        {
          $set: {
            isVerified: true,
          },
        }
      );
    },
    onError(error) {
      console.error("Verification failed", error);
    },
  });

  try {
    const payload: ActionGetResponse = {
      title: "Get your aadhar nft",
      icon: qrCodeDataUrl,
      // icon: (await generateImage()) || "",
      description: "Verify your aadhar number to get your aadhar nft",
      label: "Verify",
      type: "action",
      links: {
        actions: [
          {
            label: "Submit",
            href: `/api/actions/aadhar?id=${id}`,
            type: "post",

          },
        ],
      },
    };

    return Response.json(payload, { headers });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const body: ActionPostRequest = await req.json();
    await dbConnect();

    const entry = await aadhar.findOne({ _id: id });
    if (!entry.isVerified) {
      const message =
        "You have not completed the verifaction of your aadhar";
      return Response.json({ message } as ActionError, {
        status: 403,
        headers,
      });
    }


    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const provider = new Connection(clusterApiUrl("devnet"));

    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    const instruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey("EXBdeRCdiNChKyD7akt64n9HgSXEpUtpPEhmbnm4L6iH"),
      lamports: 0,
    });

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(instruction);

    const final_image = await generateImage();
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
        message: "You have successfully verified your aadhar",
        links: {
          next: {
            type: "inline",
            action: {
              type: "completed",
              title: "You have successfully completed the action",
              icon: final_image!,
              description:
                "Congratulations, you have successfully completed the action",
              label: "completed",
            },
          },
        },
      },
    });
    return Response.json(payload, { headers });
  } catch (err) {
    if (err instanceof Error) {
      console.error(JSON.stringify(err.toString().substring(0, 200)));
    } else {
      console.error("An unknown error occurred");
    }
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}
