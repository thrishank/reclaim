import { generateimage } from "@/app/image";
import data from "@/model/data";
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

const APP_ID = "0x950Cab8aBF0413cDD1Bd715ea2EA5a5f54EC06Ac";
const APP_SECRET =
  "0x0c0787a865a2455f23e89acd88cef51d1de001e9f6a7f7d08e37ad99cd6ff71b";
const PROVIDER_ID = "bd95d43f-e06a-4fd7-ac46-3f4c9da284f0";

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

  const entry = await data.create({});
  const id = entry._id.toString();

  reclaimProofRequest!.startSession({
    async onSuccess(proof) {
      const user_data = JSON.parse(proof.claimData.context).extractedParameters;
      await data.updateOne(
        { _id: entry._id },
        {
          $set: {
            accuracy: parseFloat(user_data.accuracy),
            wpm: parseFloat(user_data.wpm),
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
      title: "Solana Typing Speed Contest",
      icon: qrCodeDataUrl,
      description: `Show off your typing skills in this contest and stand a chance to win SOL. The contest is simple, scan the above Qr code and verfiy your monkeytype.com account wait a couple of seconds to share the data with us and click on submit. The top 10 fastest typists will win SOL.`,
      label: "Enter the contest",
      type: "action",
      links: {
        actions: [
          {
            label: "Submit",
            href: `/api/actions/reclaim?id=${id}`,
            type: "post",
            parameters: [
              {
                type: "text",
                name: "username",
                label: "Enter your name for the leaderboard",
              },
            ],
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

    // @ts-expect-error
    const username = body.data.username;

    const entry = await data.findOne({ _id: id });
    if (!entry.wpm) {
      const message =
        "You have not completed the verifaction with monkeytype yet please scan the qr code and complete the proof if you haven't yet. Or else refresh the page and try again";
      return Response.json({ message } as ActionError, {
        status: 403,
        headers,
      });
    }

    await data.updateOne({ _id: id }, { $set: { username } });

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

    const final_image = await generateimage();
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
        message: "You have successfully entered the contest",
        links: {
          next: {
            type: "inline",
            action: {
              type: "completed",
              title: "You have successfully completed the action",
              icon: final_image,
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
